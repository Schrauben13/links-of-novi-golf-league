import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export async function requireApprovedPlayer(nextPath: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!player || !player.approved) {
    redirect("/pending");
  }

  return { user, player: player as Tables<"players"> };
}

export async function requireAdmin(nextPath: string) {
  const { user, player } = await requireApprovedPlayer(nextPath);

  if (!player.is_admin) {
    redirect("/roster");
  }

  return { user, player };
}
