"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateHandicapSettings(formData: FormData) {
  await requireAdmin("/admin/handicap-settings");

  const supabase = await createClient();

  const lookbackRounds = Number(formData.get("lookback_rounds"));
  const minimumRounds = Number(formData.get("minimum_rounds"));
  const bestCount = Number(formData.get("best_count"));
  const percentageFactor = Number(formData.get("percentage_factor"));

  const allValid =
    Number.isInteger(lookbackRounds) &&
    lookbackRounds > 0 &&
    Number.isInteger(minimumRounds) &&
    minimumRounds > 0 &&
    Number.isInteger(bestCount) &&
    bestCount > 0 &&
    Number.isFinite(percentageFactor) &&
    percentageFactor > 0 &&
    percentageFactor <= 1;

  if (!allValid) {
    redirect(`/admin/handicap-settings?message=${encodeURIComponent("Please enter valid values.")}`);
  }

  if (minimumRounds > lookbackRounds) {
    redirect(
      `/admin/handicap-settings?message=${encodeURIComponent("Minimum rounds can't exceed the lookback window.")}`,
    );
  }

  if (bestCount > minimumRounds) {
    redirect(
      `/admin/handicap-settings?message=${encodeURIComponent("Best-rounds count can't exceed the minimum rounds required.")}`,
    );
  }

  const { error } = await supabase
    .from("handicap_settings")
    .update({
      lookback_rounds: lookbackRounds,
      minimum_rounds: minimumRounds,
      best_count: bestCount,
      percentage_factor: percentageFactor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) {
    redirect(`/admin/handicap-settings?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/handicap-settings");
  revalidatePath("/roster");
  revalidatePath("/profile");
  redirect("/admin/handicap-settings?message=Settings updated.");
}
