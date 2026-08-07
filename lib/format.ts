// `date` columns come back as plain "YYYY-MM-DD" strings with no timezone;
// parsing that directly with `new Date()` treats it as UTC midnight, which
// renders as the previous day in timezones behind UTC. Anchoring to local
// midnight avoids that off-by-one.
export function formatRoundDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatTeeTime(teeTime: string | null) {
  if (!teeTime) return null;
  const d = new Date(teeTime);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
