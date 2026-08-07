import Link from "next/link";
import { notFound } from "next/navigation";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatRoundDate, formatTeeTime } from "@/lib/format";

type GroupedPlayer = { id: string; name: string };

export default async function RoundDetailPage({
  params,
}: {
  params: { roundId: string };
}) {
  const { player } = await requireApprovedPlayer(`/schedule/${params.roundId}`);

  const supabase = await createClient();

  const { data: round } = await supabase
    .from("rounds")
    .select("id, date, course_name, tee_time, status")
    .eq("id", params.roundId)
    .single();

  if (!round) {
    notFound();
  }

  const { data: groupRows } = await supabase
    .from("round_players")
    .select("tee_time_group, players(id, name)")
    .eq("round_id", params.roundId)
    .order("tee_time_group", { ascending: true })
    .order("name", { ascending: true, foreignTable: "players" });

  const groups = new Map<string, GroupedPlayer[]>();
  let isPlayerInRound = false;
  for (const row of groupRows ?? []) {
    const key = row.tee_time_group !== null ? String(row.tee_time_group) : "Unassigned";
    const rowPlayer = row.players as unknown as GroupedPlayer | null;
    if (!rowPlayer) continue;
    if (rowPlayer.id === player.id) isPlayerInRound = true;
    const list = groups.get(key) ?? [];
    list.push(rowPlayer);
    groups.set(key, list);
  }

  const teeTime = formatTeeTime(round.tee_time);

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <Link href="/schedule" className="text-sm font-medium text-fairway-500">
          ← Schedule
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-fairway-800">{round.course_name}</h1>
        <p className="text-sm text-fairway-500">
          {formatRoundDate(round.date)}
          {teeTime ? ` · ${teeTime}` : ""}
        </p>
      </div>

      {round.status === "live" && isPlayerInRound && (
        <Link
          href={`/schedule/${round.id}/score`}
          className="rounded-lg bg-fairway-700 px-4 py-3 text-center text-base font-semibold text-cream-50 active:bg-fairway-800"
        >
          Enter your score
        </Link>
      )}

      {groups.size === 0 ? (
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          Tee time groups haven&rsquo;t been set yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {Array.from(groups.entries()).map(([group, players]) => (
            <div key={group} className="rounded-xl border border-fairway-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-fairway-500">
                {group === "Unassigned" ? "Unassigned" : `Group ${group}`}
              </p>
              <ul className="flex flex-col gap-1.5">
                {players.map((p) => (
                  <li key={p.id} className="text-base text-fairway-800">
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
