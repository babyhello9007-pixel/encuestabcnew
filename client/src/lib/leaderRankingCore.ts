export interface PartyBadge {
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
}

export interface LiderRanking {
  leader_name: string;
  media_valoracion: number;
  total_valoraciones: number;
  photo_url: string;
  parties: PartyBadge[];
  primary_color: string;
  is_official: boolean;
}

export interface MediaValoracionRow {
  party_key: string;
  leader_name: string;
  media_valoracion: number | null;
  total_valoraciones: number | null;
}

export interface PartyLeaderRow {
  party_key: string;
  leader_name: string;
  photo_url: string | null;
  party_configuration:
    | {
        display_name: string;
        color: string;
        logo_url: string;
      }
    | null;
}

export function buildLeaderRanking(
  mediaData: MediaValoracionRow[],
  leadersData: PartyLeaderRow[]
): LiderRanking[] {
  const leadersMap = new Map<string, PartyLeaderRow>();
  leadersData.forEach((leader) => {
    const key = `${leader.party_key}::${leader.leader_name.trim().toLocaleLowerCase()}`;
    leadersMap.set(key, leader);
  });

  const groupedMap = new Map<
    string,
    {
      totalPuntosPonderados: number;
      totalVotos: number;
      photo_url: string;
      partiesMap: Map<string, PartyBadge>;
    }
  >();

  mediaData.forEach((media) => {
    const leaderName = (media.leader_name || "").trim();
    if (!leaderName) return;

    const leaderInfo = leadersMap.get(
      `${media.party_key}::${leaderName.toLocaleLowerCase()}`
    );
    const votos = Number(media.total_valoraciones ?? 0);
    const mediaVal = Number(media.media_valoracion ?? 0);

    if (!groupedMap.has(leaderName)) {
      groupedMap.set(leaderName, {
        totalPuntosPonderados: 0,
        totalVotos: 0,
        photo_url: leaderInfo?.photo_url || "",
        partiesMap: new Map(),
      });
    }

    const currentGroup = groupedMap.get(leaderName)!;
    currentGroup.totalPuntosPonderados += mediaVal * votos;
    currentGroup.totalVotos += votos;

    if (!currentGroup.photo_url && leaderInfo?.photo_url) {
      currentGroup.photo_url = leaderInfo.photo_url;
    }

    if (!currentGroup.partiesMap.has(media.party_key)) {
      currentGroup.partiesMap.set(media.party_key, {
        party_key: media.party_key,
        display_name: leaderInfo?.party_configuration?.display_name || media.party_key,
        color: leaderInfo?.party_configuration?.color || "#6366f1",
        logo_url: leaderInfo?.party_configuration?.logo_url || "",
      });
    }
  });

  const combined = Array.from(groupedMap.entries()).map(([leader_name, data]) => {
    const parties = Array.from(data.partiesMap.values());
    const mediaPonderada =
      data.totalVotos > 0 ? data.totalPuntosPonderados / data.totalVotos : 0;

    return {
      leader_name,
      media_valoracion: mediaPonderada,
      total_valoraciones: data.totalVotos,
      photo_url: data.photo_url,
      parties,
      primary_color: parties[0]?.color || "#6366f1",
      is_official: parties.length > 0 && data.photo_url !== "" || false,
    } satisfies LiderRanking;
  });

  return combined.sort((a, b) => {
    if (b.media_valoracion !== a.media_valoracion) {
      return b.media_valoracion - a.media_valoracion;
    }
    if (b.total_valoraciones !== a.total_valoraciones) {
      return b.total_valoraciones - a.total_valoraciones;
    }
    return a.leader_name.localeCompare(b.leader_name, "es");
  });
}
