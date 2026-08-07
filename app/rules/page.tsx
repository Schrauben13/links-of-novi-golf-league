import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function RulesPage() {
  await requireApprovedPlayer("/rules");

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("handicap_settings")
    .select("lookback_rounds, minimum_rounds, best_count, percentage_factor")
    .single();

  return (
    <div className="flex flex-col gap-8 py-6">
      <h1 className="text-2xl font-bold text-fairway-800">Rules &amp; Scoring</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fairway-800">Teams &amp; matches</h2>
        <p className="text-sm text-fairway-600">
          Players are grouped into fixed 2-man teams for the season. Each week, two teams are
          paired into a match. Within a match, the lower-handicap player on each team is{" "}
          <span className="font-medium text-fairway-800">Player A</span>; the other is{" "}
          <span className="font-medium text-fairway-800">Player B</span>. A-vs-A and B-vs-B are
          two separate 9-hole individual matches, played at the same time as part of the same
          round.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fairway-800">How a round works</h2>
        <ol className="flex flex-col gap-2 text-sm text-fairway-600">
          <li>
            <span className="font-semibold text-fairway-800">1. Schedule.</span> Upcoming rounds
            show the date, tee time, and course. Tap a round to see the matches and who&rsquo;s
            playing whom.
          </li>
          <li>
            <span className="font-semibold text-fairway-800">2. Live scoring.</span> Once an
            admin marks a round &ldquo;live,&rdquo; each player enters their own strokes hole by
            hole from the round page. Scores save automatically as you go.
          </li>
          <li>
            <span className="font-semibold text-fairway-800">3. Leaderboard.</span> While a round
            is live, every match&rsquo;s points update in real time as scores come in.
          </li>
          <li>
            <span className="font-semibold text-fairway-800">4. Standings.</span> Once a round is
            marked &ldquo;completed,&rdquo; the match points count toward both teams&rsquo; season
            standings, and toward your personal record and handicap (see below).
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fairway-800">Scoring a match (22 points)</h2>
        <p className="text-sm text-fairway-600">
          Each of the 9 holes is worth <span className="font-medium text-fairway-800">2 points</span>,
          contested between the two individual matches on that hole: A-vs-A is worth 1 point,
          B-vs-B is worth 1 point. Whoever has the lower <em>net</em> score on a hole wins that
          point for their team; a tie halves it (0.5 each).
        </p>
        <p className="text-sm text-fairway-600">
          There&rsquo;s also a <span className="font-medium text-fairway-800">4-point team net
          score</span>: each team&rsquo;s combined net total (their A player&rsquo;s net + their B
          player&rsquo;s net) is compared to the other team&rsquo;s. Lower total takes all 4
          points; a tie splits it 2-2.
        </p>
        <p className="text-sm text-fairway-600">
          9 holes × 2 points + 4 team points = <span className="font-medium text-fairway-800">22
          points</span> per match.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fairway-800">Standings</h2>
        <p className="text-sm text-fairway-600">
          The Standings tab is your <span className="font-medium text-fairway-800">team&rsquo;s</span>{" "}
          cumulative score for the season &mdash; every completed match&rsquo;s points, added up,
          for both teams involved. Ranked by total points, with your team&rsquo;s match
          win-loss-tie record alongside it.
        </p>
        <p className="text-sm text-fairway-600">
          Looking for individual numbers instead &mdash; handicap, personal scoring average, your
          own A/B pairing record? That&rsquo;s under Roster &rarr; Individual stats.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fairway-800">Net scoring &amp; strokes</h2>
        <p className="text-sm text-fairway-600">
          Strokes are given based on the <em>difference</em> between the two players in each
          individual match &mdash; not each player&rsquo;s full handicap. If Team 1&rsquo;s
          Player A has a handicap of 9 and Team 2&rsquo;s Player A has a handicap of 7, Team
          1&rsquo;s Player A gets 2 strokes, applied to the 2 hardest holes on the course (lowest
          stroke index). The same comparison happens separately for the B pairing.
        </p>
        <p className="text-sm text-fairway-600">
          Handicaps used in a match are locked in when the match is set up, so results
          don&rsquo;t change later as more rounds get played and averages shift.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fairway-800">Handicap</h2>
        {settings ? (
          <p className="text-sm text-fairway-600">
            Your handicap is calculated automatically &mdash; nobody self-reports it. For each
            completed round with a full scorecard, we take your{" "}
            <span className="font-medium text-fairway-800">differential</span> (total strokes
            minus the course&rsquo;s par). Your handicap is the average of your best{" "}
            <span className="font-medium text-fairway-800">{settings.best_count}</span>{" "}
            differentials from your last{" "}
            <span className="font-medium text-fairway-800">{settings.lookback_rounds}</span>{" "}
            completed rounds, multiplied by{" "}
            <span className="font-medium text-fairway-800">{settings.percentage_factor}</span>.
            Only averaging your better rounds (rather than all of them) means one bad round
            doesn&rsquo;t inflate your handicap, and the percentage factor trims it further so a
            handicap reflects your real potential rather than your average.
          </p>
        ) : (
          <p className="text-sm text-fairway-600">
            Your handicap is calculated automatically from your best recent rounds.
          </p>
        )}
        <p className="text-sm text-fairway-600">
          You need at least{" "}
          <span className="font-medium text-fairway-800">
            {settings?.minimum_rounds ?? "a few"}
          </span>{" "}
          completed rounds on record before a handicap shows on your profile. Substitutes and
          guests without an established handicap get one entered by an admin for that match
          only. These settings are occasionally tuned by league admins, so the exact numbers
          here always reflect what&rsquo;s currently in effect.
        </p>
      </section>
    </div>
  );
}
