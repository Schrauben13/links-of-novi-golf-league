import Link from "next/link";
import AccountLink from "./account-link";

export default function MobileTopBar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-fairway-200 bg-cream-50/95 px-4 py-3 backdrop-blur md:hidden">
      <Link href="/" className="text-base font-bold text-fairway-800">
        Links of Novi
      </Link>
      <AccountLink />
    </header>
  );
}
