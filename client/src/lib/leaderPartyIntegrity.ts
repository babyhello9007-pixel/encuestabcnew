export interface CanonicalLeaderRecord {
  party_key: string;
  display_name: string;
  leader_name: string;
  photo_url?: string;
  color?: string;
  logo_url?: string;
}

export interface LeaderPreferenceRecord {
  partido: string;
  lider_preferido: string;
  total_votos?: number | string | null;
  porcentaje?: number | string | null;
}

export interface CanonicalLeaderPreference {
  partido: string;
  lider_preferido: string;
  votos: number;
  porcentaje: number;
  photo_url?: string;
  color?: string;
  display_name: string;
  logo_url?: string;
}

const normalizeIdentity = (value: unknown) => String(value ?? "").trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function canonicalizeLeaderPreferences(
  rows: LeaderPreferenceRecord[],
  leaders: CanonicalLeaderRecord[],
): CanonicalLeaderPreference[] {
  return rows.flatMap((row) => {
    const partyRef = normalizeIdentity(row.partido);
    const party = leaders.find((leader) => partyRef === normalizeIdentity(leader.party_key) || partyRef === normalizeIdentity(leader.display_name));
    if (!party) return [];
    const leaderRef = normalizeIdentity(row.lider_preferido);
    const leader = leaders.find((candidate) => candidate.party_key === party.party_key && normalizeIdentity(candidate.leader_name) === leaderRef);
    if (!leader) return [];
    return [{
      partido: party.party_key,
      lider_preferido: leader.leader_name,
      votos: Number(row.total_votos || 0),
      porcentaje: Number(row.porcentaje || 0),
      photo_url: leader.photo_url,
      color: party.color,
      display_name: party.display_name,
      logo_url: party.logo_url,
    }];
  });
}
