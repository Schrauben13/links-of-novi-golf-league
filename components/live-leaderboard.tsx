"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

type MatchTotals = Tables<"match_team_totals">;

export default function LiveLeaderboard({
  roundId,
  initialMatches,
}: {
  roundId: string;
  initialMatches: MatchTotals[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [matches, setMatches] = useState<MatchTotals[]>(initialMatches);

  useEffect(() => {
    async function refetch() {
      const { data } = await supabase.from("match_team_totals").select("*").eq("round_id", roundId);
      if (data) setMatches(data);
    }

    // Points involve stroke allocation and hole-by-hole comparisons that
    // are already computed correctly in SQL (match_team_totals). Rather than
    // re-deriving that logic in the client, just re-fetch the view whenever
    // a score changes -- guarantees the leaderboard can never drift from
    // what score entry actually wrote.
    const channel = supabase
      .channel(`leaderboard-round-${roundId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores", filter: `round_id=eq.${roundId}` },
        () => {
          refetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roundId]);

  if (matches.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
        No matches set up for this round yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {matches.map((m) => (
        <div key={m.match_id} className="rounded-xl border border-fairway-200 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fairway-500">
            Thru {m.holes_decided ?? 0} / 9
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-fairway-800">{m.team_a_name}</p>
              <p className="text-xs text-fairway-500">
                {m.team_a_hole_points} hole pt{m.team_a_hole_points === 1 ? "" : "s"}
                {m.team_a_net_points !== null ? ` + ${m.team_a_net_points} net` : ""}
              </p>
            </div>
            <span className="text-xl font-bold text-fairway-800">{m.team_a_total_points}</span>
          </div>

          <div className="my-2 border-t border-dashed border-fairway-100" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold text-fairway-800">{m.team_b_name}</p>
              <p className="text-xs text-fairway-500">
                {m.team_b_hole_points} hole pt{m.team_b_hole_points === 1 ? "" : "s"}
                {m.team_b_net_points !== null ? ` + ${m.team_b_net_points} net` : ""}
              </p>
            </div>
            <span className="text-xl font-bold text-fairway-800">{m.team_b_total_points}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
