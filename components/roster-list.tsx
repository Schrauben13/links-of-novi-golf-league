"use client";

import { useMemo, useState } from "react";
import type { Tables } from "@/lib/supabase/types";

type Player = Pick<Tables<"players">, "id" | "name" | "handicap">;

export default function RosterList({ players }: { players: Player[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? players.filter((p) => p.name.toLowerCase().includes(q)) : players;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [players, query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fairway-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players..."
          aria-label="Search players"
          className="w-full rounded-lg border border-fairway-200 bg-white py-3 pl-9 pr-4 text-base text-fairway-800 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-fairway-200 bg-cream-100 p-6 text-center text-sm text-fairway-500">
          No players match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className="divide-y divide-fairway-100 overflow-hidden rounded-xl border border-fairway-200 bg-white">
          {filtered.map((player) => (
            <li key={player.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium text-fairway-800">{player.name}</span>
              <span className="text-sm text-fairway-500">
                {player.handicap !== null ? player.handicap : "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
