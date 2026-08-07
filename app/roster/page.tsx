import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import RosterList from "@/components/roster-list";

export default async function RosterPage() {
  await requireApprovedPlayer("/roster");

  const supabase = await createClient();
  const { data: players } = await supabase
    .from("players")
    .select("id, name, handicap")
    .order("name", { ascending: true });

  return (
    <div className="flex flex-col gap-4 py-6">
      <h1 className="text-2xl font-bold text-fairway-800">Roster</h1>
      <RosterList players={players ?? []} />
    </div>
  );
}
