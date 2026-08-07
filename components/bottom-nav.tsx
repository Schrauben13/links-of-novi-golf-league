"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "./nav-links";
import { navIcons } from "./nav-icons";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-fairway-200 bg-cream-50/95 backdrop-blur md:hidden"
      aria-label="Primary"
    >
      <ul className="flex items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = navIcons[link.href];
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors ${
                  isActive ? "text-fairway-700" : "text-fairway-400"
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? "text-accent" : ""}`} />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
