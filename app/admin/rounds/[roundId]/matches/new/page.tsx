import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createMatch } from "./actions";

type Player = { id: string; name: string; team_id: string | null };

function PlayerSlot({
  prefix,
  label,
  players,
  defaultPlayerId,
}: {
  prefix: string;
  label: string;
  players: Player[];
  defaultPlayerId?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-fairway-100 p-3">
      <p className="text-sm font-semibold text-fairway-700">{label}</p>
      <select
        name={`${prefix}_player_id`}
        defaultValue={defaultPlayerId ?? ""}
        className="rounded-lg border border-fairway-200 bg-white px-3 py-2 text-sm text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
      >
        <option value="">— Guest / substitute (enter below) —</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        name={`${prefix}_guest_name`}
        placeholder="Guest name (if not selected above)"
        className="rounded-lg border border-fairway-200 bg-white px-3 py-2 text-sm text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
      />
      <input
        type="number"
        step="0.1"
        name={`${prefix}_handicap`}
        placeholder="Handicap override (optional; required for guests)"
        className="rounded-lg border border-fairway-200 bg-white px-3 py-2 text-sm text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
      />
    </div>
  );
}

export default async function NewMatchPage({
  params,
  searchParams,
}: {
  params: { roundId: string };
  searchParams: { team_a?: string; team_b?: string; message?: string };
}) {
  await requireAdmin("/schedule");

  const supabase = await createClient();

  const { data: round } = await supabase
    .from("rounds")
    .select("id, date, course_name")
    .eq("id", params.roundId)
    .single();

  if (!round) notFound();

  const [{ data: teams }, { data: players }] = await Promise.all([
    supabase.from("teams").select("id, name").order("name"),
    supabase
      .from("players")
      .select("id, name, team_id")
      .eq("approved", true)
      .eq("is_guest", false)
      .order("name"),
  ]);

  const teamAId = searchParams.team_a;
  const teamBId = searchParams.team_b;
  const teamsChosen = Boolean(teamAId && teamBId && teamAId !== teamBId);

  const rosterOf = (teamId: string | undefined) =>
    (players ?? []).filter((p) => p.team_id === teamId);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <div>
        <Link href={`/schedule/${round.id}`} className="text-sm font-medium text-fairway-500">
          ← Round
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-fairway-800">Add a match</h1>
        <p className="text-sm text-fairway-500">
          {round.course_name} · {round.date}
        </p>
      </div>

      {searchParams.message && (
        <p className="rounded-lg bg-fairway-100 px-4 py-3 text-sm text-fairway-700">
          {searchParams.message}
        </p>
      )}

      <form method="get" className="flex flex-col gap-4 rounded-xl border border-fairway-200 bg-white p-4">
        <p className="text-sm font-semibold text-fairway-700">1. Pick the two teams</p>
        <select
          name="team_a"
          defaultValue={teamAId ?? ""}
          required
          className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
        >
          <option value="" disabled>
            Team A
          </option>
          {(teams ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          name="team_b"
          defaultValue={teamBId ?? ""}
          required
          className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
        >
          <option value="" disabled>
            Team B
          </option>
          {(teams ?? []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-fairway-200 px-4 py-3 text-sm font-medium text-fairway-700"
        >
          Continue
        </button>
      </form>

      {teamsChosen && (
        <form action={createMatch} className="flex flex-col gap-5">
          <input type="hidden" name="round_id" value={round.id} />
          <input type="hidden" name="team_a_id" value={teamAId} />
          <input type="hidden" name="team_b_id" value={teamBId} />

          <p className="text-sm font-semibold text-fairway-700">
            2. Who&rsquo;s playing? (Player A/B is assigned automatically by lower handicap)
          </p>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-fairway-500">
              {(teams ?? []).find((t) => t.id === teamAId)?.name}
            </p>
            <PlayerSlot
              prefix="a1"
              label="Player 1"
              players={players ?? []}
              defaultPlayerId={rosterOf(teamAId)[0]?.id}
            />
            <PlayerSlot
              prefix="a2"
              label="Player 2"
              players={players ?? []}
              defaultPlayerId={rosterOf(teamAId)[1]?.id}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-fairway-500">
              {(teams ?? []).find((t) => t.id === teamBId)?.name}
            </p>
            <PlayerSlot
              prefix="b1"
              label="Player 1"
              players={players ?? []}
              defaultPlayerId={rosterOf(teamBId)[0]?.id}
            />
            <PlayerSlot
              prefix="b2"
              label="Player 2"
              players={players ?? []}
              defaultPlayerId={rosterOf(teamBId)[1]?.id}
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-fairway-700 px-4 py-3 text-base font-semibold text-cream-50 active:bg-fairway-800"
          >
            Create match
          </button>
        </form>
      )}
    </div>
  );
}
