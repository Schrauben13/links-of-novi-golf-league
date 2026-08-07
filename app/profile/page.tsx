import { requireApprovedPlayer } from "@/lib/auth";
import { signOut } from "@/app/actions";

export default async function ProfilePage() {
  const { player } = await requireApprovedPlayer("/profile");

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
            {player.handicap !== null ? player.handicap : "Not yet calculated"}
          </p>
          <p className="mt-1 text-xs text-fairway-400">
            Calculated by the league from your posted scores.
          </p>
        </div>
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
