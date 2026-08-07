import Link from "next/link";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RosterList from "@/components/roster-list";

export default async function RosterPage() {
  const { player } = await requireApprovedPlayer("/roster");

  const supabase = await createClient();
  const { data: players, error } = await supabase
    .from("player_handicaps")
    .select("player_id, name, handicap")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Couldn't load the roster: ${error.message}`);
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-fairway-800">Roster</h1>
        {player.is_admin && (
          <Link
            href="/admin/handicap-settings"
            className="-mr-2 flex min-h-[44px] items-center px-2 text-sm font-medium text-accent-dark underline underline-offset-2"
          >
            Handicap settings
          </Link>
        )}
      </div>
      <Link
        href="/roster/stats"
        className="-mt-2 -mb-2 self-start text-sm font-medium text-accent-dark underline underline-offset-2"
      >
        Individual stats →
      </Link>
      <RosterList players={players ?? []} />
    </div>
  );
}
