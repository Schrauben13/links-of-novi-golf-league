import Link from "next/link";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatRoundDate, formatTeeTime } from "@/lib/format";
import LiveLeaderboard from "@/components/live-leaderboard";

export default async function LeaderboardPage() {
  await requireApprovedPlayer("/leaderboard");

  const supabase = await createClient();

  const { data: liveRound } = await supabase
    .from("rounds")
    .select("id, date, course_name, tee_time, status")
    .eq("status", "live")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!liveRound) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <h1 className="text-2xl font-bold text-fairway-800">Leaderboard</h1>
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          No round is live right now.
        </p>
        <Link href="/schedule" className="text-center text-sm font-medium text-accent-dark underline underline-offset-2">
          View schedule
        </Link>
      </div>
    );
  }

  const [{ data: roster }, { data: holes }, { data: scores }] = await Promise.all([
    supabase
      .from("round_players")
      .select("player_id, players(id, name)")
      .eq("round_id", liveRound.id),
    supabase
      .from("course_holes")
      .select("hole_number, par")
      .eq("course_name", liveRound.course_name),
    supabase
      .from("scores")
      .select("player_id, hole_number, strokes")
      .eq("round_id", liveRound.id),
  ]);

  const players = (roster ?? [])
    .map((row) => row.players as unknown as { id: string; name: string } | null)
    .filter((p): p is { id: string; name: string } => p !== null);

  const teeTime = formatTeeTime(liveRound.tee_time);

  return (
    <div className="flex flex-col gap-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-fairway-800">Leaderboard</h1>
        <p className="text-sm text-fairway-500">
          {liveRound.course_name} · {formatRoundDate(liveRound.date)}
          {teeTime ? ` · ${teeTime}` : ""}
        </p>
      </div>

      <LiveLeaderboard
        roundId={liveRound.id}
        players={players}
        holes={holes ?? []}
        initialScores={scores ?? []}
      />
    </div>
  );
}
