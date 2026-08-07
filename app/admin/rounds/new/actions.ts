"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

  const assignments: { round_id: string; player_id: string; tee_time_group: number }[] = [];
  for (const [key, value] of Array.from(formData.entries())) {
    if (!key.startsWith("group_")) continue;
    const raw = String(value).trim();
    if (!raw) continue;
    const group = Number(raw);
    if (!Number.isInteger(group) || group < 1) continue;
    assignments.push({
      round_id: round.id,
      player_id: key.slice("group_".length),
      tee_time_group: group,
    });
  }

  if (assignments.length > 0) {
    const { error: assignError } = await supabase.from("round_players").insert(assignments);
    if (assignError) {
      redirect(
        `/schedule/${round.id}?message=${encodeURIComponent(
          `Round created, but some player assignments failed: ${assignError.message}`,
        )}`,
      );
    }
  }

  revalidatePath("/schedule");
  redirect(`/schedule/${round.id}`);
}
