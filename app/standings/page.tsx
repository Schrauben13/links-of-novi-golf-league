import Link from "next/link";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function StandingsPage() {
  await requireApprovedPlayer("/standings");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_stats")
    .select("player_id, name, handicap, rounds_played, scoring_average, match_wins, match_losses, match_halves, total_hole_points")
    .order("match_wins", { ascending: false })
    .order("total_hole_points", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Couldn't load stats: ${error.message}`);
  }

  const rows = data ?? [];

  return (
    <div className="flex flex-col gap-4 py-6">
      <h1 className="text-2xl font-bold text-fairway-800">Individual Stats</h1>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          No approved players yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-fairway-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fairway-200 bg-cream-100 text-left text-xs font-semibold uppercase tracking-wide text-fairway-500">
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2 text-right">Hcp</th>
                <th className="px-3 py-2 text-right">Record</th>
                <th className="px-3 py-2 text-right">Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fairway-100">
              {rows.map((row) => (
                <tr key={row.player_id}>
                  <td className="px-3 py-3 font-medium text-fairway-800">{row.name}</td>
                  <td className="px-3 py-3 text-right text-fairway-500">
                    {row.handicap ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-fairway-800">
                    {row.match_wins}-{row.match_losses}-{row.match_halves}
                  </td>
                  <td className="px-3 py-3 text-right text-fairway-500">
                    {row.scoring_average ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-center text-xs text-fairway-400">
        Record is win-loss-halve in your individual A/B pairing (separate from your team&rsquo;s
        overall match result).{" "}
        <Link href="/rules" className="underline underline-offset-2">
          Full rules
        </Link>
      </p>
    </div>
  );
}
