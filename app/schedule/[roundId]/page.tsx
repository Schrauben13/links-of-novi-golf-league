import Link from "next/link";
import { notFound } from "next/navigation";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatRoundDate, formatTeeTime } from "@/lib/format";
import BackLink from "@/components/back-link";

type Participant = { player_id: string; role: string; name: string; is_substitute: boolean };
type MatchView = {
  id: string;
  team_a_id: string;
  team_b_id: string;
  team_a_name: string;
  team_b_name: string;
  teamA: Participant[];
  teamB: Participant[];
};

export default async function RoundDetailPage({
  params,
}: {
  params: { roundId: string };
}) {
  const { player } = await requireApprovedPlayer(`/schedule/${params.roundId}`);

  const supabase = await createClient();

  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .select("id, date, course_name, tee_time, status")
    .eq("id", params.roundId)
    .single();

  if (roundError && roundError.code !== "PGRST116") {
    throw new Error(`Couldn't load this round: ${roundError.message}`);
  }
  if (!round) {
    notFound();
  }

  const { data: matchRows, error: matchesError } = await supabase
    .from("matches")
    .select(
      "id, team_a_id, team_b_id, team_a:teams!matches_team_a_id_fkey(name), team_b:teams!matches_team_b_id_fkey(name)",
    )
    .eq("round_id", round.id);

  if (matchesError) {
    throw new Error(`Couldn't load matches for this round: ${matchesError.message}`);
  }

  const matchIds = (matchRows ?? []).map((m) => m.id);

  const { data: participantRows, error: participantsError } = matchIds.length
    ? await supabase
        .from("match_players")
        .select("match_id, team_id, role, player_id, is_substitute, players(name)")
        .in("match_id", matchIds)
        .order("role", { ascending: true })
    : { data: [], error: null };

  if (participantsError) {
    throw new Error(`Couldn't load players for this round: ${participantsError.message}`);
  }

  let isPlayerInRound = false;
  const matches: MatchView[] = (matchRows ?? []).map((m) => {
    const teamA = (participantRows ?? [])
      .filter((r) => r.match_id === m.id && r.team_id === m.team_a_id)
      .map((r) => {
        if (r.player_id === player.id) isPlayerInRound = true;
        return {
          player_id: r.player_id,
          role: r.role,
          is_substitute: r.is_substitute,
          name: (r.players as unknown as { name: string } | null)?.name ?? "—",
        };
      });
    const teamB = (participantRows ?? [])
      .filter((r) => r.match_id === m.id && r.team_id === m.team_b_id)
      .map((r) => {
        if (r.player_id === player.id) isPlayerInRound = true;
        return {
          player_id: r.player_id,
          role: r.role,
          is_substitute: r.is_substitute,
          name: (r.players as unknown as { name: string } | null)?.name ?? "—",
        };
      });
    return {
      id: m.id,
      team_a_id: m.team_a_id,
      team_b_id: m.team_b_id,
      team_a_name: (m.team_a as unknown as { name: string } | null)?.name ?? "Team A",
      team_b_name: (m.team_b as unknown as { name: string } | null)?.name ?? "Team B",
      teamA,
      teamB,
    };
  });

  const teeTime = formatTeeTime(round.tee_time);

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <BackLink href="/schedule">← Schedule</BackLink>
        <h1 className="mt-1 text-2xl font-bold text-fairway-800">{round.course_name}</h1>
        <p className="text-sm text-fairway-500">
          {formatRoundDate(round.date)}
          {teeTime ? ` · ${teeTime}` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {round.status === "live" && isPlayerInRound && (
          <Link
            href={`/schedule/${round.id}/score`}
            className="flex-1 rounded-lg bg-fairway-700 px-4 py-3 text-center text-base font-semibold text-cream-50 active:bg-fairway-800"
          >
            Enter your score
          </Link>
        )}
        {player.is_admin && (
          <Link
            href={`/admin/rounds/${round.id}/matches/new`}
            className="flex-1 rounded-lg border border-fairway-200 px-4 py-3 text-center text-sm font-medium text-fairway-700"
          >
            + Add match
          </Link>
        )}
      </div>

      {matches.length === 0 ? (
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          No matches set up for this round yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {matches.map((m) => (
            <div key={m.id} className="rounded-xl border border-fairway-200 bg-white p-4">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-semibold text-fairway-800">{m.team_a_name}</p>
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {m.teamA.map((p) => (
                      <li key={p.player_id} className="text-sm text-fairway-600">
                        {p.role}: {p.name}
                        {p.is_substitute ? " (sub)" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center text-xs font-semibold uppercase tracking-wide text-fairway-400">
                  vs
                </div>
                <div>
                  <p className="text-sm font-semibold text-fairway-800">{m.team_b_name}</p>
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {m.teamB.map((p) => (
                      <li key={p.player_id} className="text-sm text-fairway-600">
                        {p.role}: {p.name}
                        {p.is_substitute ? " (sub)" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
