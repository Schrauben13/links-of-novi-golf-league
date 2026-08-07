import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

export default async function PendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: player } = await supabase
    .from("players")
    .select("approved")
    .eq("auth_user_id", user.id)
    .single();

  if (player?.approved) {
    redirect("/roster");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-3xl">
        ⏳
      </div>
      <h1 className="text-xl font-bold text-fairway-800">Awaiting approval</h1>
      <p className="text-sm text-fairway-500">
        Your account has been created. An admin needs to approve you before you can see the
        roster, scores, and standings.
      </p>
      <form action={signOut}>
        <button
          type="submit"
          className="mt-2 rounded-lg border border-fairway-200 px-4 py-2 text-sm font-medium text-fairway-700"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
