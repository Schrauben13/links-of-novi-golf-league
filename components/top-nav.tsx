"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "./nav-links";

export default function TopNav({ accountSlot }: { accountSlot?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-fairway-200 bg-cream-50/95 backdrop-blur md:block">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-fairway-800">
          Links of Novi{" "}
          <span className="font-normal text-fairway-500">Golf League</span>
        </Link>
        <div className="flex items-center gap-8">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? "text-fairway-800 border-b-2 border-accent pb-1"
                        : "text-fairway-500 hover:text-fairway-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          {accountSlot}
        </div>
      </div>
    </header>
  );
}
