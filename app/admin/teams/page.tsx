import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createTeam, assignPlayerToTeam } from "./actions";

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  await requireAdmin("/admin/teams");

  const supabase = await createClient();

  const [{ data: teams }, { data: players }] = await Promise.all([
    supabase.from("teams").select("id, name").order("name"),
    supabase
      .from("players")
      .select("id, name, team_id")
      .eq("approved", true)
      .eq("is_guest", false)
      .order("name"),
  ]);

  const rosterByTeam = new Map<string, { id: string; name: string }[]>();
  const unassigned: { id: string; name: string }[] = [];
  for (const p of players ?? []) {
    if (p.team_id) {
      const list = rosterByTeam.get(p.team_id) ?? [];
      list.push({ id: p.id, name: p.name });
      rosterByTeam.set(p.team_id, list);
    } else {
      unassigned.push({ id: p.id, name: p.name });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8 py-6">
      <div>
        <h1 className="text-2xl font-bold text-fairway-800">Teams</h1>
        <p className="mt-1 text-sm text-fairway-500">Admin only</p>
      </div>

      {searchParams.message && (
        <p className="rounded-lg bg-fairway-100 px-4 py-3 text-sm text-fairway-700">
          {searchParams.message}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fairway-500">
          Current teams
        </h2>
        {(teams ?? []).length === 0 ? (
          <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-4 text-center text-sm text-fairway-500">
            No teams yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(teams ?? []).map((team) => (
              <li key={team.id} className="rounded-xl border border-fairway-200 bg-white p-4">
                <p className="font-semibold text-fairway-800">{team.name}</p>
                <p className="mt-1 text-sm text-fairway-500">
                  {(rosterByTeam.get(team.id) ?? []).map((p) => p.name).join(" & ") ||
                    "No players assigned"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fairway-500">
          Create a team
        </h2>
        <form action={createTeam} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-fairway-700">
              Team name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="player1_id" className="text-sm font-medium text-fairway-700">
              Player 1
            </label>
            <select
              id="player1_id"
              name="player1_id"
              required
              defaultValue=""
              className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
            >
              <option value="" disabled>
                Select a player
              </option>
              {(players ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="player2_id" className="text-sm font-medium text-fairway-700">
              Player 2
            </label>
            <select
              id="player2_id"
              name="player2_id"
              required
              defaultValue=""
              className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
            >
              <option value="" disabled>
                Select a player
              </option>
              {(players ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-fairway-700 px-4 py-3 text-base font-semibold text-cream-50 active:bg-fairway-800"
          >
            Create team
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fairway-500">
          Reassign a player
        </h2>
        <p className="text-xs text-fairway-400">
          Moves a player onto a different team, or off their team entirely (leave blank).
        </p>
        <form action={assignPlayerToTeam} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="player_id" className="text-sm font-medium text-fairway-700">
              Player
            </label>
            <select
              id="player_id"
              name="player_id"
              required
              defaultValue=""
              className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
            >
              <option value="" disabled>
                Select a player
              </option>
              {(players ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="team_id" className="text-sm font-medium text-fairway-700">
              Team
            </label>
            <select
              id="team_id"
              name="team_id"
              defaultValue=""
              className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
            >
              <option value="">No team</option>
              {(teams ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg border border-fairway-200 px-4 py-3 text-sm font-medium text-fairway-700"
          >
            Update
          </button>
        </form>
      </section>

      {unassigned.length > 0 && (
        <p className="text-xs text-fairway-400">
          Not on a team: {unassigned.map((p) => p.name).join(", ")}
        </p>
      )}
    </div>
  );
}
