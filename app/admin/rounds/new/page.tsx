import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createRound } from "./actions";

const COURSES = ["East", "West", "South"];

export default async function NewRoundPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  await requireAdmin("/admin/rounds/new");

  const supabase = await createClient();
  const { data: players } = await supabase
    .from("players")
    .select("id, name")
    .eq("approved", true)
    .order("name");

  const roster = players ?? [];

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-fairway-800">New round</h1>
        <p className="mt-1 text-sm text-fairway-500">Admin only</p>
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

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-fairway-700">Tee time groups</p>
          <p className="text-xs text-fairway-400">
            Give each player a group number. Leave blank to assign later.
          </p>

          {roster.length === 0 ? (
            <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-4 text-center text-sm text-fairway-500">
              No approved players yet.
            </p>
          ) : (
            <ul className="divide-y divide-fairway-100 overflow-hidden rounded-xl border border-fairway-200 bg-white">
              {roster.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-base text-fairway-800">{p.name}</span>
                  <input
                    type="number"
                    name={`group_${p.id}`}
                    min={1}
                    inputMode="numeric"
                    placeholder="Group #"
                    className="w-24 rounded-lg border border-fairway-200 bg-white px-3 py-2 text-right text-sm text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
                  />
                </li>
              ))}
            </ul>
          )}
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
          Create round
        </button>
      </form>
    </div>
  );
}
