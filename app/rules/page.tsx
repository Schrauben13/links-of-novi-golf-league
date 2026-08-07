import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const POINTS_SCALE = [
  { place: "1st", points: 10 },
  { place: "2nd", points: 8 },
  { place: "3rd", points: 6 },
  { place: "4th", points: 5 },
  { place: "5th", points: 4 },
  { place: "6th", points: 3 },
  { place: "7th", points: 2 },
  { place: "8th+", points: 1 },
];

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
        <h2 className="text-lg font-semibold text-fairway-800">How a round works</h2>
        <ol className="flex flex-col gap-2 text-sm text-fairway-600">
          <li>
            <span className="font-semibold text-fairway-800">1. Schedule.</span> Upcoming
            rounds show the date, tee time, and course. Tap a round to see tee time groups.
          </li>
          <li>
            <span className="font-semibold text-fairway-800">2. Live scoring.</span> Once an
            admin marks a round &ldquo;live,&rdquo; each player enters their own strokes hole by
            hole from the round page. Scores save automatically as you go.
          </li>
          <li>
            <span className="font-semibold text-fairway-800">3. Leaderboard.</span> While a
            round is live, everyone&rsquo;s scores update on the leaderboard in real time,
            sorted by total score relative to par.
          </li>
          <li>
            <span className="font-semibold text-fairway-800">4. Standings.</span> Once a round
            is marked &ldquo;completed,&rdquo; it counts toward season standings and your
            handicap (see below).
          </li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-fairway-800">Season standings</h2>
        <p className="text-sm text-fairway-600">
          For every completed round where you post a full 9-hole score, you&rsquo;re ranked
          against the field by total gross strokes and awarded points by finish:
        </p>
        <div className="overflow-x-auto rounded-xl border border-fairway-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fairway-200 bg-cream-100 text-left text-xs font-semibold uppercase tracking-wide text-fairway-500">
                <th className="px-3 py-2">Finish</th>
                <th className="px-3 py-2 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-fairway-100">
              {POINTS_SCALE.map((row) => (
                <tr key={row.place}>
                  <td className="px-3 py-2 font-medium text-fairway-800">{row.place}</td>
                  <td className="px-3 py-2 text-right text-fairway-700">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-fairway-600">
          If two or more players tie, they split the points for the positions they cover. For
          example, a tie for 2nd and 3rd means both players get{" "}
          <span className="font-medium text-fairway-800">(8 + 6) / 2 = 7</span> points each, and
          the next player takes 4th. Your season points are the sum across every completed
          round. This uses gross scores for now &mdash; not adjusted by handicap.
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
          completed rounds on record before a handicap shows on your profile. These settings
          are occasionally tuned by league admins, so the exact numbers here always reflect
          what&rsquo;s currently in effect.
        </p>
      </section>
    </div>
  );
}
