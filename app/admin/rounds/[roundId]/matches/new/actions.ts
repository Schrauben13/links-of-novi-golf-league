"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

type SlotInput = {
  playerId: string;
  guestName: string;
  handicapOverride: string;
};

type ResolvedSlot = { playerId: string; handicap: number; isGuest: boolean };

async function resolveSlot(
  supabase: Supabase,
  slot: SlotInput,
  computedHandicaps: Map<string, number | null>,
): Promise<ResolvedSlot | { error: string }> {
  if (!slot.playerId) {
    const name = slot.guestName.trim();
    if (!name) return { error: "Enter a name for the guest player." };
    if (!slot.handicapOverride.trim()) {
      return { error: `Enter a handicap for guest "${name}".` };
    }
    const handicap = Number(slot.handicapOverride);
    if (!Number.isFinite(handicap)) return { error: `Invalid handicap for guest "${name}".` };

    const { data: guest, error } = await supabase
      .from("players")
      .insert({ name, is_guest: true, approved: false })
      .select("id")
      .single();
    if (error || !guest) return { error: error?.message ?? "Could not create guest player." };
    return { playerId: guest.id, handicap, isGuest: true };
  }

  const handicap = slot.handicapOverride.trim()
    ? Number(slot.handicapOverride)
    : (computedHandicaps.get(slot.playerId) ?? null);

  if (handicap === null || !Number.isFinite(handicap)) {
    return { error: "This player doesn't have a handicap yet -- enter one manually." };
  }

  return { playerId: slot.playerId, handicap, isGuest: false };
}

function isError(x: ResolvedSlot | { error: string }): x is { error: string } {
  return "error" in x;
}

export async function createMatch(formData: FormData) {
  await requireAdmin("/schedule");

  const supabase = await createClient();

  const roundId = String(formData.get("round_id") ?? "");
  const teamAId = String(formData.get("team_a_id") ?? "");
  const teamBId = String(formData.get("team_b_id") ?? "");
  const backUrl = `/admin/rounds/${roundId}/matches/new`;
  const teamQuery = `team_a=${teamAId}&team_b=${teamBId}`;

  if (!roundId || !teamAId || !teamBId || teamAId === teamBId) {
    redirect(`${backUrl}?message=${encodeURIComponent("Pick two different teams.")}`);
  }

  const slots: Record<"a1" | "a2" | "b1" | "b2", SlotInput> = {
    a1: {
      playerId: String(formData.get("a1_player_id") ?? ""),
      guestName: String(formData.get("a1_guest_name") ?? ""),
      handicapOverride: String(formData.get("a1_handicap") ?? ""),
    },
    a2: {
      playerId: String(formData.get("a2_player_id") ?? ""),
      guestName: String(formData.get("a2_guest_name") ?? ""),
      handicapOverride: String(formData.get("a2_handicap") ?? ""),
    },
    b1: {
      playerId: String(formData.get("b1_player_id") ?? ""),
      guestName: String(formData.get("b1_guest_name") ?? ""),
      handicapOverride: String(formData.get("b1_handicap") ?? ""),
    },
    b2: {
      playerId: String(formData.get("b2_player_id") ?? ""),
      guestName: String(formData.get("b2_guest_name") ?? ""),
      handicapOverride: String(formData.get("b2_handicap") ?? ""),
    },
  };

  for (const key of ["a1", "a2", "b1", "b2"] as const) {
    if (!slots[key].playerId && !slots[key].guestName.trim()) {
      redirect(`${backUrl}?${teamQuery}&message=${encodeURIComponent("Every slot needs either a player or a guest name.")}`);
    }
  }

  const { data: handicapRows } = await supabase.from("player_handicaps").select("player_id, handicap");
  const computedHandicaps = new Map(
    (handicapRows ?? [])
      .filter((r): r is { player_id: string; handicap: number | null } => r.player_id !== null)
      .map((r) => [r.player_id, r.handicap]),
  );

  const a1 = await resolveSlot(supabase, slots.a1, computedHandicaps);
  const a2 = await resolveSlot(supabase, slots.a2, computedHandicaps);
  const b1 = await resolveSlot(supabase, slots.b1, computedHandicaps);
  const b2 = await resolveSlot(supabase, slots.b2, computedHandicaps);

  const firstError = [a1, a2, b1, b2].find(isError);
  if (firstError) {
    redirect(`${backUrl}?${teamQuery}&message=${encodeURIComponent(firstError.error)}`);
  }
  if (isError(a1) || isError(a2) || isError(b1) || isError(b2)) {
    redirect(`${backUrl}?${teamQuery}&message=${encodeURIComponent("Could not resolve players.")}`);
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({ round_id: roundId, team_a_id: teamAId, team_b_id: teamBId })
    .select("id")
    .single();

  if (matchError || !match) {
    redirect(`${backUrl}?${teamQuery}&message=${encodeURIComponent(matchError?.message ?? "Could not create match.")}`);
  }

  const { data: rosterRows } = await supabase
    .from("players")
    .select("id, team_id")
    .in("id", [a1.playerId, a2.playerId, b1.playerId, b2.playerId].filter((id) => id));
  const teamOf = new Map((rosterRows ?? []).map((r) => [r.id, r.team_id]));

  const teamAFirstIsA = a1.handicap <= a2.handicap;
  const teamBFirstIsA = b1.handicap <= b2.handicap;

  const matchPlayers = [
    {
      match_id: match.id,
      team_id: teamAId,
      player_id: a1.playerId,
      role: teamAFirstIsA ? "A" : "B",
      handicap: a1.handicap,
      is_substitute: a1.isGuest || teamOf.get(a1.playerId) !== teamAId,
    },
    {
      match_id: match.id,
      team_id: teamAId,
      player_id: a2.playerId,
      role: teamAFirstIsA ? "B" : "A",
      handicap: a2.handicap,
      is_substitute: a2.isGuest || teamOf.get(a2.playerId) !== teamAId,
    },
    {
      match_id: match.id,
      team_id: teamBId,
      player_id: b1.playerId,
      role: teamBFirstIsA ? "A" : "B",
      handicap: b1.handicap,
      is_substitute: b1.isGuest || teamOf.get(b1.playerId) !== teamBId,
    },
    {
      match_id: match.id,
      team_id: teamBId,
      player_id: b2.playerId,
      role: teamBFirstIsA ? "B" : "A",
      handicap: b2.handicap,
      is_substitute: b2.isGuest || teamOf.get(b2.playerId) !== teamBId,
    },
  ];

  const { error: mpError } = await supabase.from("match_players").insert(matchPlayers);
  if (mpError) {
    redirect(
      `/schedule/${roundId}?message=${encodeURIComponent(`Match created, but assigning players failed: ${mpError.message}`)}`,
    );
  }

  revalidatePath("/schedule");
  revalidatePath(`/schedule/${roundId}`);
  redirect(`/schedule/${roundId}`);
}
