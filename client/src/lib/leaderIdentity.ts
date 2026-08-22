export interface LeaderAffiliation {
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
}

export interface LeaderCandidate extends LeaderAffiliation {
  id: number;
  leader_name: string;
  photo_url: string | null;
}

export interface ConsolidatedLeader extends LeaderAffiliation {
  id: number;
  identity_key: string;
  leader_name: string;
  photo_url: string;
  affiliations: LeaderAffiliation[];
}

export function getLeaderIdentityKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es");
}

export function consolidateLeaders(candidates: LeaderCandidate[]): ConsolidatedLeader[] {
  const groups = new Map<string, LeaderCandidate[]>();

  candidates.forEach((candidate) => {
    const identityKey = getLeaderIdentityKey(candidate.leader_name);
    if (!identityKey) return;
    const group = groups.get(identityKey) ?? [];
    group.push(candidate);
    groups.set(identityKey, group);
  });

  return Array.from(groups.entries())
    .map(([identity_key, members]) => {
      const orderedMembers = [...members].sort((first, second) => first.id - second.id || first.party_key.localeCompare(second.party_key, "es"));
      const canonical = orderedMembers[0];
      const affiliations = orderedMembers
        .map(({ party_key, display_name, color, logo_url }) => ({ party_key, display_name, color, logo_url }))
        .filter((party, index, all) => all.findIndex((item) => item.party_key === party.party_key) === index);
      const photo = orderedMembers.find(member => member.photo_url)?.photo_url || "/placeholder-avatar.png";

      return {
        id: canonical.id,
        identity_key,
        leader_name: canonical.leader_name.trim(),
        photo_url: photo,
        party_key: canonical.party_key,
        display_name: canonical.display_name,
        color: canonical.color,
        logo_url: canonical.logo_url,
        affiliations,
      };
    })
    .sort((first, second) => first.leader_name.localeCompare(second.leader_name, "es"));
}
