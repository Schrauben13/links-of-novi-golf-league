"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect(`/profile?message=${encodeURIComponent("Fill in all password fields.")}`);
  }

  if (newPassword.length < 6) {
    redirect(
      `/profile?message=${encodeURIComponent("New password must be at least 6 characters.")}`,
    );
  }

  if (newPassword !== confirmPassword) {
    redirect(`/profile?message=${encodeURIComponent("New password and confirmation don't match.")}`);
  }

  // Re-verify the current password before changing it -- an already-open
  // session shouldn't be enough on its own to change the password (e.g. a
  // shared/left-open device).
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    redirect(`/profile?message=${encodeURIComponent("Current password is incorrect.")}`);
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

  if (updateError) {
    redirect(`/profile?message=${encodeURIComponent(updateError.message)}`);
  }

  redirect("/profile?message=Password updated.");
}
