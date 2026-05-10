// lib/friends.ts
import { supabase } from "./supabase";
import type { Friendship } from "@/types/multiplayer";

/** Search users by username prefix or exact email */
export async function searchUsers(query: string) {
  if (!supabase || query.length < 2) return [];
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .or(`username.ilike.${query}%,display_name.ilike.${query}%`)
    .limit(10);
  return data ?? [];
}

/** Send a friend request */
export async function sendFriendRequest(requesterId: string, addresseeId: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.from("friendships").insert({
    requester_id: requesterId,
    addressee_id: addresseeId,
    status: "pending",
  });
  if (error) throw error;
}

/** Accept a friend request */
export async function acceptFriendRequest(friendshipId: string) {
  if (!supabase) return;
  await supabase
    .from("friendships")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", friendshipId);
}

/** Remove or decline a friendship */
export async function removeFriend(friendshipId: string) {
  if (!supabase) return;
  await supabase.from("friendships").delete().eq("id", friendshipId);
}

/** Get all friendships for a user */
export async function getFriends(userId: string): Promise<{
  friends: Friendship[];
  pending_received: Friendship[];
  pending_sent: Friendship[];
}> {
  if (!supabase) return { friends: [], pending_received: [], pending_sent: [] };

  const { data } = await supabase
    .from("v_friends")
    .select("*")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  const all = (data ?? []) as Friendship[];
  return {
    friends: all.filter(f => f.status === "accepted"),
    pending_received: all.filter(f => f.status === "pending" && f.addressee_id === userId),
    pending_sent: all.filter(f => f.status === "pending" && f.requester_id === userId),
  };
}

/** Check friendship status between two users */
export async function getFriendshipStatus(
  userId: string,
  targetId: string
): Promise<Friendship | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${userId})`
    )
    .single();
  return data ?? null;
}
