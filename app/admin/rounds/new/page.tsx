import { requireAdmin } from "@/lib/auth";
import { createRound } from "./actions";

const COURSES = ["East", "West", "South"];

export default async function NewRoundPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  await requireAdmin("/admin/rounds/new");

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-fairway-800">New round</h1>
        <p className="mt-1 text-sm text-fairway-500">
          Admin only. Next you&rsquo;ll pair teams into matches for this round.
        </p>
      </div>

      <form action={createRound} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className="text-sm font-medium text-fairway-700">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="course_name" className="text-sm font-medium text-fairway-700">
            Course
          </label>
          <select
            id="course_name"
            name="course_name"
            required
            defaultValue=""
            className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
          >
            <option value="" disabled>
              Select a course
            </option>
            {COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tee_time" className="text-sm font-medium text-fairway-700">
            First tee time <span className="text-fairway-400">(optional)</span>
          </label>
          <input
            id="tee_time"
            name="tee_time"
            type="time"
            className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
          />
        </div>

        {searchParams.message && (
          <p className="rounded-lg bg-fairway-100 px-4 py-3 text-sm text-fairway-700">
            {searchParams.message}
          </p>
        )}

        <button
          type="submit"
          className="rounded-lg bg-fairway-700 px-4 py-3 text-base font-semibold text-cream-50 active:bg-fairway-800"
        >
          Next: pair matches
        </button>
      </form>
    </div>
  );
}
