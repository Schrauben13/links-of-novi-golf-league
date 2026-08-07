"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

type Player = { id: string; name: string };
type Hole = { hole_number: number; par: number };
type ScoreRow = Pick<Tables<"scores">, "player_id" | "hole_number" | "strokes">;

function relativeToParLabel(value: number) {
  if (value === 0) return "E";
  return value > 0 ? `+${value}` : `${value}`;
}

function scoreKey(playerId: string, holeNumber: number) {
  return `${playerId}:${holeNumber}`;
}

export default function LiveLeaderboard({
  roundId,
  players,
  holes,
  initialScores,
}: {
  roundId: string;
  players: Player[];
  holes: Hole[];
  initialScores: ScoreRow[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const parByHole = useMemo(() => {
    const map = new Map<number, number>();
    for (const hole of holes) map.set(hole.hole_number, hole.par);
    return map;
  }, [holes]);

  const [scores, setScores] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    for (const row of initialScores) {
      if (row.strokes !== null) map.set(scoreKey(row.player_id, row.hole_number), row.strokes);
    }
    return map;
  });

  useEffect(() => {
    const channel = supabase
      .channel(`leaderboard-round-${roundId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores", filter: `round_id=eq.${roundId}` },
        (payload) => {
          setScores((prev) => {
            const next = new Map(prev);
            if (payload.eventType === "DELETE") {
              const old = payload.old as Partial<ScoreRow>;
              if (old.player_id && old.hole_number !== undefined) {
                next.delete(scoreKey(old.player_id, old.hole_number));
              }
              return next;
            }
            const row = payload.new as ScoreRow;
            const key = scoreKey(row.player_id, row.hole_number);
            if (row.strokes === null) {
              next.delete(key);
            } else {
              next.set(key, row.strokes);
            }
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roundId]);

  const standings = useMemo(() => {
    const rows = players.map((player) => {
      let thru = 0;
      let totalStrokes = 0;
      let totalPar = 0;
      for (const hole of holes) {
        const strokes = scores.get(scoreKey(player.id, hole.hole_number));
        if (strokes !== undefined) {
          thru += 1;
          totalStrokes += strokes;
          totalPar += parByHole.get(hole.hole_number) ?? 0;
        }
      }
      return { player, thru, totalStrokes, relative: totalStrokes - totalPar };
    });

    const started = rows
      .filter((r) => r.thru > 0)
      .sort((a, b) => a.relative - b.relative || b.thru - a.thru);
    const notStarted = rows
      .filter((r) => r.thru === 0)
      .sort((a, b) => a.player.name.localeCompare(b.player.name));

    return { started, notStarted };
  }, [players, holes, scores, parByHole]);

  return (
    <div className="flex flex-col gap-4">
      {standings.started.length === 0 ? (
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          No scores posted yet.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {standings.started.map((row, i) => (
            <li
              key={row.player.id}
              className={`flex items-center justify-between rounded-xl border p-4 ${
                i === 0 ? "border-accent bg-accent/10" : "border-fairway-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center text-sm font-semibold text-fairway-400">
                  {i + 1}
                </span>
                <div>
                  <p className="text-base font-semibold text-fairway-800">{row.player.name}</p>
                  <p className="text-xs text-fairway-500">
                    Thru {row.thru === holes.length ? "F" : row.thru}
                  </p>
                </div>
              </div>
              <span className="text-xl font-bold text-fairway-800">
                {relativeToParLabel(row.relative)}
              </span>
            </li>
          ))}
        </ol>
      )}

      {standings.notStarted.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-fairway-500">
            Not started
          </p>
          <ul className="divide-y divide-fairway-100 overflow-hidden rounded-xl border border-fairway-200 bg-white">
            {standings.notStarted.map((row) => (
              <li key={row.player.id} className="px-4 py-3 text-base text-fairway-800">
                {row.player.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
