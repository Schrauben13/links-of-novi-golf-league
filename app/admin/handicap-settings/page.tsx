import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updateHandicapSettings } from "./actions";

export default async function HandicapSettingsPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  await requireAdmin("/admin/handicap-settings");

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("handicap_settings")
    .select("lookback_rounds, minimum_rounds, best_count, percentage_factor")
    .single();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-bold text-fairway-800">Handicap settings</h1>
        <p className="mt-1 text-sm text-fairway-500">Admin only</p>
      </div>

      <div className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-4 text-sm text-fairway-600">
        Handicap = average of the best <strong>N</strong> differentials (strokes − course par)
        among a player&rsquo;s last <strong>W</strong> completed rounds, × the percentage factor.
        A player needs at least the minimum rounds before a handicap shows.
      </div>

      <form action={updateHandicapSettings} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lookback_rounds" className="text-sm font-medium text-fairway-700">
            Lookback window (most recent rounds considered)
          </label>
          <input
            id="lookback_rounds"
            name="lookback_rounds"
            type="number"
            min={1}
            defaultValue={settings?.lookback_rounds ?? 20}
            required
            className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="minimum_rounds" className="text-sm font-medium text-fairway-700">
            Minimum rounds required
          </label>
          <input
            id="minimum_rounds"
            name="minimum_rounds"
            type="number"
            min={1}
            defaultValue={settings?.minimum_rounds ?? 15}
            required
            className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="best_count" className="text-sm font-medium text-fairway-700">
            Best-rounds count (N)
          </label>
          <input
            id="best_count"
            name="best_count"
            type="number"
            min={1}
            defaultValue={settings?.best_count ?? 8}
            required
            className="rounded-lg border border-fairway-200 bg-white px-4 py-3 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="percentage_factor" className="text-sm font-medium text-fairway-700">
            Percentage factor (0–1)
          </label>
          <input
            id="percentage_factor"
            name="percentage_factor"
            type="number"
            min={0.01}
            max={1}
            step={0.01}
            defaultValue={settings?.percentage_factor ?? 0.8}
            required
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
          Save
        </button>
      </form>
    </div>
  );
}
