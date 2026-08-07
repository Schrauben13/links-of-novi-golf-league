"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createTeam(formData: FormData) {
  await requireAdmin("/admin/teams");

  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const player1Id = String(formData.get("player1_id") ?? "");
  const player2Id = String(formData.get("player2_id") ?? "");

  if (!name || !player1Id || !player2Id) {
    redirect(`/admin/teams?message=${encodeURIComponent("Team name and both players are required.")}`);
  }

  if (player1Id === player2Id) {
    redirect(`/admin/teams?message=${encodeURIComponent("A team needs two different players.")}`);
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ name })
    .select("id")
    .single();

  if (teamError || !team) {
    redirect(`/admin/teams?message=${encodeURIComponent(teamError?.message ?? "Could not create team.")}`);
  }

  const [{ error: err1 }, { error: err2 }] = await Promise.all([
    supabase.rpc("set_player_team", { target_player_id: player1Id, new_team_id: team.id }),
    supabase.rpc("set_player_team", { target_player_id: player2Id, new_team_id: team.id }),
  ]);

  if (err1 || err2) {
    redirect(
      `/admin/teams?message=${encodeURIComponent(
        `Team created, but assigning players failed: ${err1?.message ?? err2?.message}`,
      )}`,
    );
  }

  revalidatePath("/admin/teams");
  redirect("/admin/teams?message=Team created.");
}

export async function assignPlayerToTeam(formData: FormData) {
  await requireAdmin("/admin/teams");

  const supabase = await createClient();

  const playerId = String(formData.get("player_id") ?? "");
  const teamIdRaw = String(formData.get("team_id") ?? "");
  const teamId = teamIdRaw === "" ? null : teamIdRaw;

  if (!playerId) {
    redirect(`/admin/teams?message=${encodeURIComponent("Pick a player.")}`);
  }

  const { error } = await supabase.rpc("set_player_team", {
    target_player_id: playerId,
    // The generated type doesn't reflect that this uuid param accepts SQL
    // NULL (to unassign a player from any team) -- it does at runtime.
    new_team_id: teamId as string,
  });

  if (error) {
    redirect(`/admin/teams?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/teams");
  redirect("/admin/teams?message=Player assignment updated.");
}
