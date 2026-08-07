import { notFound } from "next/navigation";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ScoreCard from "@/components/score-card";
import BackLink from "@/components/back-link";

export default async function ScorePage({
  params,
  searchParams,
}: {
  params: { roundId: string };
  searchParams: { as?: string };
}) {
  const { player } = await requireApprovedPlayer(`/schedule/${params.roundId}/score`);

  const supabase = await createClient();

  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .select("id, course_name, status")
    .eq("id", params.roundId)
    .single();

  if (roundError && roundError.code !== "PGRST116") {
    throw new Error(`Couldn't load this round: ${roundError.message}`);
  }
  if (!round) {
    notFound();
  }

  const backLink = <BackLink href={`/schedule/${round.id}`}>← Back to round</BackLink>;

  if (round.status !== "live") {
    return (
      <div className="flex flex-col gap-4 py-6">
        {backLink}
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          Scoring isn&rsquo;t open for this round yet.
        </p>
      </div>
    );
  }

  // Normally you're entering your own strokes; an admin can proxy-enter for
  // someone else (mainly guests, who have no login of their own) via ?as=.
  const targetPlayerId = searchParams.as && player.is_admin ? searchParams.as : player.id;
  const isProxy = targetPlayerId !== player.id;

  const { data: matchesForRound } = await supabase.from("matches").select("id").eq("round_id", round.id);
  const matchIds = (matchesForRound ?? []).map((m) => m.id);

  const { data: myMatchPlayer } = matchIds.length
    ? await supabase
        .from("match_players")
        .select("match_id, team_id, role, player_id, players(name)")
        .in("match_id", matchIds)
        .eq("player_id", targetPlayerId)
        .maybeSingle()
    : { data: null };

  if (!myMatchPlayer) {
    return (
      <div className="flex flex-col gap-4 py-6">
        {backLink}
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          {isProxy
            ? "That player isn't in a match for this round."
            : "You haven't been added to a match for this round. Ask an admin."}
        </p>
      </div>
    );
  }

  const { data: opponent } = await supabase
    .from("match_players")
    .select("player_id, players(name)")
    .eq("match_id", myMatchPlayer.match_id)
    .eq("role", myMatchPlayer.role)
    .neq("team_id", myMatchPlayer.team_id)
    .maybeSingle();

  const opponentName = (opponent?.players as unknown as { name: string } | null)?.name;
  const targetName = (myMatchPlayer.players as unknown as { name: string } | null)?.name;

  const [
    { data: holes, error: holesError },
    { data: existingScores, error: scoresError },
  ] = await Promise.all([
    supabase
      .from("course_holes")
      .select("hole_number, par")
      .eq("course_name", round.course_name)
      .order("hole_number", { ascending: true }),
    supabase
      .from("scores")
      .select("hole_number, strokes")
      .eq("round_id", round.id)
      .eq("player_id", targetPlayerId),
  ]);

  if (holesError || scoresError) {
    throw new Error(`Couldn't load your scorecard: ${(holesError ?? scoresError)?.message}`);
  }

  const initialStrokes: Record<number, number | null> = {};
  for (const row of existingScores ?? []) {
    initialStrokes[row.hole_number] = row.strokes;
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      {backLink}
      <div>
        <h1 className="text-2xl font-bold text-fairway-800">
          {isProxy ? `${targetName}'s scorecard` : "Your scorecard"}
        </h1>
        <p className="text-sm text-fairway-500">
          {round.course_name} · Match {myMatchPlayer.role}
          {opponentName ? ` vs ${opponentName}` : ""}
        </p>
      </div>
      <ScoreCard
        roundId={round.id}
        playerId={targetPlayerId}
        holes={holes ?? []}
        initialStrokes={initialStrokes}
      />
    </div>
  );
}
