export type NavLink = {
  href: string;
  label: string;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/roster", label: "Roster" },
  { href: "/standings", label: "Standings" },
];
