import Link from "next/link";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { updatePassword } from "./actions";
import SubmitButton from "@/components/submit-button";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const { player } = await requireApprovedPlayer("/profile");

  const supabase = await createClient();
  const [{ data: handicap }, { data: history }] = await Promise.all([
    supabase
      .from("player_handicaps")
      .select("handicap, rounds_in_window, minimum_rounds")
      .eq("player_id", player.id)
      .single(),
    supabase
      .from("handicap_history")
      .select("handicap, recorded_at")
      .eq("player_id", player.id)
      .order("recorded_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <h1 className="text-2xl font-bold text-fairway-800">My profile</h1>

      <div className="flex flex-col gap-4 rounded-xl border border-fairway-200 bg-white p-4">
        <div>
          <p className="text-sm text-fairway-500">Name</p>
          <p className="text-lg font-semibold text-fairway-800">{player.name}</p>
        </div>
        <div>
          <p className="text-sm text-fairway-500">Email</p>
          <p className="text-base text-fairway-700">{player.email}</p>
        </div>
        <div>
          <p className="text-sm text-fairway-500">Handicap</p>
          <p className="text-lg font-semibold text-fairway-800">
            {handicap?.handicap !== null && handicap?.handicap !== undefined
              ? handicap.handicap
              : "Not yet calculated"}
          </p>
          <p className="mt-1 text-xs text-fairway-400">
            {handicap && handicap.minimum_rounds !== null && handicap.handicap === null
              ? `Calculated by the league once you've posted ${handicap.minimum_rounds} completed rounds (${handicap.rounds_in_window ?? 0} so far).`
              : "Calculated by the league from your best recent rounds."}{" "}
            <Link href="/rules" className="underline underline-offset-2">
              How it&rsquo;s calculated
            </Link>
          </p>
        </div>
      </div>

      {history && history.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-fairway-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-fairway-500">
            Handicap trend
          </h2>
          <ul className="flex flex-col gap-1.5">
            {history.map((row, i) => {
              const prev = history[i + 1];
              const delta = prev ? row.handicap - prev.handicap : null;
              return (
                <li
                  key={row.recorded_at}
                  className="flex items-center justify-between text-sm text-fairway-700"
                >
                  <span>
                    {new Date(row.recorded_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-fairway-800">{row.handicap}</span>
                    {delta !== null && delta !== 0 && (
                      <span className={delta < 0 ? "text-fairway-600" : "text-accent-dark"}>
                        {delta < 0 ? "▼" : "▲"} {Math.abs(delta).toFixed(1)}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-fairway-200 bg-white p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fairway-500">
          Change password
        </h2>
        <form action={updatePassword} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="current_password" className="text-sm font-medium text-fairway-700">
              Current password
            </label>
            <input
              id="current_password"
              name="current_password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="new_password" className="text-sm font-medium text-fairway-700">
              New password
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm_password" className="text-sm font-medium text-fairway-700">
              Confirm new password
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
            />
          </div>

          {searchParams.message && (
            <p className="rounded-lg bg-fairway-100 px-4 py-3 text-sm text-fairway-700">
              {searchParams.message}
            </p>
          )}

          <SubmitButton
            pendingText="Updating…"
            className="rounded-lg bg-fairway-700 px-4 py-3 text-base font-semibold text-cream-50 active:bg-fairway-800"
          >
            Update password
          </SubmitButton>
        </form>
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="w-full rounded-lg border border-fairway-200 px-4 py-3 text-sm font-medium text-fairway-700"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
