import Link from "next/link";
import { notFound } from "next/navigation";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ScoreCard from "@/components/score-card";

export default async function ScorePage({
  params,
}: {
  params: { roundId: string };
}) {
  const { player } = await requireApprovedPlayer(`/schedule/${params.roundId}/score`);

  const supabase = await createClient();

  const { data: round } = await supabase
    .from("rounds")
    .select("id, course_name, status")
    .eq("id", params.roundId)
    .single();

  if (!round) {
    notFound();
  }

  const backLink = (
    <Link href={`/schedule/${round.id}`} className="text-sm font-medium text-fairway-500">
      ← Back to round
    </Link>
  );

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

  const { data: membership } = await supabase
    .from("round_players")
    .select("player_id")
    .eq("round_id", round.id)
    .eq("player_id", player.id)
    .maybeSingle();

  if (!membership) {
    return (
      <div className="flex flex-col gap-4 py-6">
        {backLink}
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          You haven&rsquo;t been added to this round. Ask an admin to add you to a tee time group.
        </p>
      </div>
    );
  }

  const [{ data: holes }, { data: existingScores }] = await Promise.all([
    supabase
      .from("course_holes")
      .select("hole_number, par")
      .eq("course_name", round.course_name)
      .order("hole_number", { ascending: true }),
    supabase
      .from("scores")
      .select("hole_number, strokes")
      .eq("round_id", round.id)
      .eq("player_id", player.id),
  ]);

  const initialStrokes: Record<number, number | null> = {};
  for (const row of existingScores ?? []) {
    initialStrokes[row.hole_number] = row.strokes;
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      {backLink}
      <div>
        <h1 className="text-2xl font-bold text-fairway-800">Your scorecard</h1>
        <p className="text-sm text-fairway-500">{round.course_name}</p>
      </div>
      <ScoreCard
        roundId={round.id}
        playerId={player.id}
        holes={holes ?? []}
        initialStrokes={initialStrokes}
      />
    </div>
  );
}
