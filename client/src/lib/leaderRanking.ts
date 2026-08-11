import { supabase } from "@/lib/supabase";
import {
  buildLeaderRanking,
  type LiderRanking,
  type MediaValoracionRow,
  type PartyLeaderRow,
} from "./leaderRankingCore";

export { buildLeaderRanking } from "./leaderRankingCore";
export type {
  LiderRanking,
  MediaValoracionRow,
  PartyLeaderRow,
  PartyBadge,
} from "./leaderRankingCore";

export async function fetchLeaderRanking(): Promise<LiderRanking[]> {
  const [mediaRes, leadersRes] = await Promise.all([
    supabase.from("media_valoraciones_lideres").select("*"),
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

  if (mediaRes.error) throw mediaRes.error;
  if (leadersRes.error) throw leadersRes.error;

  return buildLeaderRanking(
    (mediaRes.data as MediaValoracionRow[]) || [],
    (leadersRes.data as unknown as PartyLeaderRow[]) || []
  );
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
