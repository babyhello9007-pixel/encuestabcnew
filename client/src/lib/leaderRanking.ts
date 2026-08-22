import { supabase } from "@/lib/supabase";
import {
  buildLeaderRanking,
  type LiderRanking,
  type MediaValoracionRow,
  type PartyLeaderRow,
} from "./leaderRankingCore";
import { aggregatePartyLeaderRatings } from "./leaderRatingAggregation";

export { buildLeaderRanking } from "./leaderRankingCore";
export type {
  LiderRanking,
  MediaValoracionRow,
  PartyLeaderRow,
  PartyBadge,
} from "./leaderRankingCore";

export async function fetchLeaderRanking(): Promise<LiderRanking[]> {
  const [ratingsRes, leadersRes] = await Promise.all([
    supabase
      .from("valoraciones_lideres")
      .select("party_key, leader_name, valoracion")
      .gte("valoracion", 1)
      .lte("valoracion", 10)
      .limit(10_000),
    supabase
      .from("party_leaders")
      .select(
        `
          party_key,
          leader_name,
          photo_url,
          party_configuration(display_name, color, logo_url)
        `
      )
      .eq("is_active", true),
  ]);

  if (ratingsRes.error) throw ratingsRes.error;
  if (leadersRes.error) throw leadersRes.error;

  const aggregated = aggregatePartyLeaderRatings((ratingsRes.data || []) as Array<{ party_key: string; leader_name: string; valoracion: number }>);
  const leaderByKey = new Map<string, PartyLeaderRow>();
  ((leadersRes.data as unknown as PartyLeaderRow[]) || []).forEach((leader) => {
    leaderByKey.set(`${leader.party_key.toLocaleLowerCase()}::${leader.leader_name.trim().toLocaleLowerCase()}`, leader);
  });

  return aggregated.map((row) => {
    const leader = leaderByKey.get(`${row.party_key.toLocaleLowerCase()}::${row.leader_name.toLocaleLowerCase()}`);
    const party = leader?.party_configuration;
    return {
      leader_name: row.leader_name,
      media_valoracion: row.total ? row.score / row.total : 0,
      total_valoraciones: row.total,
      photo_url: leader?.photo_url || "",
      parties: [{
        party_key: row.party_key,
        display_name: party?.display_name || row.party_key,
        color: party?.color || "#9CA3AF",
        logo_url: party?.logo_url || "",
      }],
      primary_color: party?.color || "#9CA3AF",
    } satisfies LiderRanking;
  }).sort((a, b) => b.media_valoracion - a.media_valoracion || b.total_valoraciones - a.total_valoraciones || a.leader_name.localeCompare(b.leader_name, "es"));
}

export function subscribeToLeaderRatings(onChange: () => void) {
  const channel = supabase
    .channel("leader-ratings-ranking")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "valoraciones_lideres",
      },
      onChange
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
