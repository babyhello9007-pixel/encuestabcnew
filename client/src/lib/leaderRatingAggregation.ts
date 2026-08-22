export interface RawLeaderRating {
  party_key: string | null | undefined;
  leader_name: string | null | undefined;
  valoracion: number | string | null | undefined;
}

export interface AggregatedLeaderRating {
  party_key: string;
  leader_name: string;
  total: number;
  score: number;
}

/** Agrupa únicamente por partido y persona, sin mezclar líderes homónimos. */
export function aggregatePartyLeaderRatings(ratings: RawLeaderRating[]): AggregatedLeaderRating[] {
  const groups = new Map<string, AggregatedLeaderRating>();
  ratings.forEach((rating) => {
    const partyKey = String(rating.party_key || "").trim();
    const leaderName = String(rating.leader_name || "").trim();
    const score = Number(rating.valoracion);
    if (!partyKey || !leaderName || !Number.isFinite(score) || score < 1 || score > 10) return;

    const key = `${partyKey.toLocaleLowerCase()}::${leaderName.toLocaleLowerCase()}`;
    const current = groups.get(key) || { party_key: partyKey, leader_name: leaderName, total: 0, score: 0 };
    current.total += 1;
    current.score += score;
    groups.set(key, current);
  });
  return Array.from(groups.values());
}
