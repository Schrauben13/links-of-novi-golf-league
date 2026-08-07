import Link from "next/link";
import { requireApprovedPlayer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatRoundDate, formatTeeTime } from "@/lib/format";

export default async function SchedulePage() {
  const { player } = await requireApprovedPlayer("/schedule");

  const supabase = await createClient();
  const { data: rounds, error } = await supabase
    .from("rounds")
    .select("id, date, course_name, tee_time, status")
    .in("status", ["upcoming", "live"])
    .order("date", { ascending: true })
    .order("tee_time", { ascending: true });

  if (error) {
    throw new Error(`Couldn't load the schedule: ${error.message}`);
  }

  const list = rounds ?? [];

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-fairway-800">Schedule</h1>
        {player.is_admin && (
          <Link
            href="/admin/rounds/new"
            className="flex min-h-[44px] items-center rounded-lg bg-fairway-700 px-3 text-sm font-semibold text-cream-50 active:bg-fairway-800"
          >
            + New round
          </Link>
        )}
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          No upcoming rounds scheduled yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((round, i) => {
            const teeTime = formatTeeTime(round.tee_time);
            return (
              <li key={round.id}>
                <Link
                  href={`/schedule/${round.id}`}
                  className={`block rounded-xl border p-4 transition-colors ${
                    i === 0 ? "border-accent bg-accent/10" : "border-fairway-200 bg-white"
                  }`}
                >
                  <div className="mb-1 flex gap-2">
                    {i === 0 && (
                      <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                        Next round
                      </span>
                    )}
                    {round.status === "live" && (
                      <span className="inline-block rounded-full bg-fairway-700 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cream-50">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-fairway-800">{round.course_name}</p>
                  <p className="text-sm text-fairway-500">
                    {formatRoundDate(round.date)}
                    {teeTime ? ` · ${teeTime}` : ""}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
