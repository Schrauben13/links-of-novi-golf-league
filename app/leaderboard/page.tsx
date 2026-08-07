import Link from "next/link";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatRoundDate, formatTeeTime } from "@/lib/format";
import LiveLeaderboard from "@/components/live-leaderboard";

export default async function LeaderboardPage() {
  await requireApprovedPlayer("/leaderboard");

  const supabase = await createClient();

  const { data: liveRound, error: liveRoundError } = await supabase
    .from("rounds")
    .select("id, date, course_name, tee_time, status")
    .eq("status", "live")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (liveRoundError) {
    throw new Error(`Couldn't load the leaderboard: ${liveRoundError.message}`);
  }

  if (!liveRound) {
    return (
      <div className="flex flex-col gap-4 py-6">
        <h1 className="text-2xl font-bold text-fairway-800">Leaderboard</h1>
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          No round is live right now.
        </p>
        <Link
          href="/schedule"
          className="text-center text-sm font-medium text-accent-dark underline underline-offset-2"
        >
          View schedule
        </Link>
      </div>
    );
  }

  const { data: matches, error: matchesError } = await supabase
    .from("match_team_totals")
    .select("*")
    .eq("round_id", liveRound.id);

  if (matchesError) {
    throw new Error(`Couldn't load live match points: ${matchesError.message}`);
  }

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

      <LiveLeaderboard roundId={liveRound.id} initialMatches={matches ?? []} />
    </div>
  );
}
