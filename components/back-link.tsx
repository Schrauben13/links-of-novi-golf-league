import Link from "next/link";
import type { ReactNode } from "react";

export default function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-[44px] items-center px-2 text-sm font-medium text-fairway-500 active:text-fairway-700"
    >
      {children}
    </Link>
  );
}
