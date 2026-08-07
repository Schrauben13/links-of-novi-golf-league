"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "") || "/roster";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/login?message=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: player } = await supabase
    .from("players")
    .select("approved")
    .eq("auth_user_id", user!.id)
    .single();

  if (!player?.approved) {
    redirect("/pending");
  }

  redirect(next);
}
