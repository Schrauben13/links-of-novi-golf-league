"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createRound(formData: FormData) {
  await requireAdmin("/admin/rounds/new");

  const supabase = await createClient();

  const date = String(formData.get("date") ?? "");
  const courseName = String(formData.get("course_name") ?? "");
  const teeTimeRaw = String(formData.get("tee_time") ?? "");

  if (!date || !courseName) {
    redirect(`/admin/rounds/new?message=${encodeURIComponent("Date and course are required.")}`);
  }

  const teeTime = teeTimeRaw ? new Date(`${date}T${teeTimeRaw}:00`).toISOString() : null;

  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .insert({ date, course_name: courseName, tee_time: teeTime })
    .select("id")
    .single();

  if (roundError || !round) {
    redirect(
      `/admin/rounds/new?message=${encodeURIComponent(roundError?.message ?? "Could not create round.")}`,
    );
  }

  redirect(`/admin/rounds/${round.id}/matches/new`);
}
