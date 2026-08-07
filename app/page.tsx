import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-fairway-700 text-3xl text-cream-50">
        ⛳
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-fairway-800">
          Links of Novi Golf League
        </h1>
        <p className="text-base text-fairway-600">
          Links of Novi &middot; Novi, MI
        </p>
      </div>
      <p className="max-w-md text-sm text-fairway-500">
        Welcome to the league hub. Check the schedule, track the leaderboard,
        browse the roster, and follow season standings.
      </p>
      <Link
        href="/rules"
        className="text-sm font-medium text-accent-dark underline underline-offset-2"
      >
        Rules &amp; scoring
      </Link>
    </div>
  );
}
