import Link from "next/link";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function StandingsPage() {
  await requireApprovedPlayer("/standings");

  const supabase = await createClient();
  const { data } = await supabase
    .from("standings")
    .select("player_id, name, points, rounds_played")
    .order("points", { ascending: false })
    .order("rounds_played", { ascending: false })
    .order("name", { ascending: true });

  const rows = data ?? [];

  return (
    <div className="flex flex-col gap-4 py-6">
      <h1 className="text-2xl font-bold text-fairway-800">Standings</h1>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          No completed rounds yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-fairway-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fairway-200 bg-cream-100 text-left text-xs font-semibold uppercase tracking-wide text-fairway-500">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2 text-right">Points</th>
                <th className="px-3 py-2 text-right">Rounds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fairway-100">
              {rows.map((row, i) => (
                <tr key={row.player_id} className={i === 0 ? "bg-accent/10" : ""}>
                  <td className="px-3 py-3 font-semibold text-fairway-500">{i + 1}</td>
                  <td className="px-3 py-3 font-medium text-fairway-800">{row.name}</td>
                  <td className="px-3 py-3 text-right text-base font-bold text-fairway-800">
                    {row.points}
                  </td>
                  <td className="px-3 py-3 text-right text-fairway-500">{row.rounds_played}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-center text-xs text-fairway-400">
        Points per round by finish: 1st 10 · 2nd 8 · 3rd 6 · 4th 5 · 5th 4 · 6th 3 · 7th 2 · 8th+
        1 (ties split). Gross scoring for now.{" "}
        <Link href="/rules" className="underline underline-offset-2">
          Full rules
        </Link>
      </p>
    </div>
  );
}
