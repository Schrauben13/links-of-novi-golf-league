import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AccountLink() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="-mr-2 flex min-h-[44px] items-center px-2 text-sm font-medium text-fairway-500 hover:text-fairway-700"
      >
        Log in
      </Link>
    );
  }

  return (
    <Link
      href="/profile"
      aria-label="My profile"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-fairway-700 text-sm font-semibold text-cream-50"
    >
      {user.email?.[0]?.toUpperCase() ?? "?"}
    </Link>
  );
}
