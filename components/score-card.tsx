"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Hole = { hole_number: number; par: number };
type SaveStatus = "idle" | "saving" | "saved" | "error";

function relativeToParLabel(value: number) {
  if (value === 0) return "E";
  return value > 0 ? `+${value}` : `${value}`;
}

export default function ScoreCard({
  roundId,
  playerId,
  holes,
  initialStrokes,
}: {
  roundId: string;
  playerId: string;
  holes: Hole[];
  initialStrokes: Record<number, number | null>;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [strokes, setStrokes] = useState<Record<number, number | null>>(initialStrokes);
  const [status, setStatus] = useState<Record<number, SaveStatus>>({});
  const savedTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const { thru, totalStrokes, totalPar } = useMemo(() => {
    let thruCount = 0;
    let strokeSum = 0;
    let parSum = 0;
    for (const hole of holes) {
      const value = strokes[hole.hole_number];
      if (value !== null && value !== undefined) {
        thruCount += 1;
        strokeSum += value;
        parSum += hole.par;
      }
    }
    return { thru: thruCount, totalStrokes: strokeSum, totalPar: parSum };
  }, [holes, strokes]);

  async function save(holeNumber: number, value: number | null) {
    setStatus((prev) => ({ ...prev, [holeNumber]: "saving" }));

    const { error } =
      value === null
        ? await supabase
            .from("scores")
            .delete()
            .eq("round_id", roundId)
            .eq("player_id", playerId)
            .eq("hole_number", holeNumber)
        : await supabase
            .from("scores")
            .upsert(
              { round_id: roundId, player_id: playerId, hole_number: holeNumber, strokes: value },
              { onConflict: "round_id,player_id,hole_number" },
            );

    setStatus((prev) => ({ ...prev, [holeNumber]: error ? "error" : "saved" }));

    if (!error) {
      clearTimeout(savedTimers.current[holeNumber]);
      savedTimers.current[holeNumber] = setTimeout(() => {
        setStatus((prev) => ({ ...prev, [holeNumber]: "idle" }));
      }, 1500);
    }
  }

  function adjust(hole: Hole, delta: 1 | -1) {
    const current = strokes[hole.hole_number] ?? null;
    let next: number | null;
    if (delta === 1) {
      next = current === null ? Math.max(hole.par - 2, 1) : Math.min(current + 1, 15);
    } else {
      next = current === null ? null : current - 1 < 1 ? null : current - 1;
    }
    if (next === current) return;
    setStrokes((prev) => ({ ...prev, [hole.hole_number]: next }));
    save(hole.hole_number, next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-16 z-30 flex items-center justify-between rounded-xl border border-fairway-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:top-4">
        <span className="text-sm font-medium text-fairway-500">Thru {thru}</span>
        <span className="text-lg font-bold text-fairway-800">
          {thru > 0 ? relativeToParLabel(totalStrokes - totalPar) : "–"}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {holes.map((hole) => {
          const value = strokes[hole.hole_number] ?? null;
          const holeStatus = status[hole.hole_number] ?? "idle";
          return (
            <li
              key={hole.hole_number}
              className="flex items-center justify-between gap-3 rounded-xl border border-fairway-200 bg-white p-3"
            >
              <div>
                <p className="text-base font-semibold text-fairway-800">Hole {hole.hole_number}</p>
                <p className="text-xs text-fairway-500">
                  Par {hole.par}
                  {holeStatus === "saving" && " · Saving…"}
                  {holeStatus === "saved" && " · Saved"}
                  {holeStatus === "error" && (
                    <span className="text-red-600"> · Couldn&rsquo;t save, try again</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Subtract a stroke on hole ${hole.hole_number}`}
                  onClick={() => adjust(hole, -1)}
                  disabled={value === null}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-fairway-200 text-xl font-semibold text-fairway-700 disabled:opacity-30 active:bg-fairway-100"
                >
                  −
                </button>
                <span className="w-8 text-center text-2xl font-bold tabular-nums text-fairway-800">
                  {value ?? "–"}
                </span>
                <button
                  type="button"
                  aria-label={`Add a stroke on hole ${hole.hole_number}`}
                  onClick={() => adjust(hole, 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-fairway-700 text-xl font-semibold text-cream-50 active:bg-fairway-800"
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
