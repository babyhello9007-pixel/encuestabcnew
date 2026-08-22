export interface PartyOptionForOrdering {
  party_key: string;
  display_name: string;
}

export interface PartyVoteRow {
  id: string | null | undefined;
  votos: number | string | null | undefined;
}

const normalize = (value: string | null | undefined) => String(value ?? "")
  .replace(/ç/gi, "z")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .toLocaleLowerCase("es");

export function sortPartiesByCurrentVote<T extends PartyOptionForOrdering>(
  parties: T[],
  voteRows: PartyVoteRow[]
): T[] {
  const votesByIdentifier = new Map<string, number>();
  voteRows.forEach((row) => {
    const id = normalize(row.id);
    if (!id) return;
    votesByIdentifier.set(id, Number(row.votos) || 0);
  });

  const getVotes = (party: T) =>
    Math.max(
      votesByIdentifier.get(normalize(party.party_key)) ?? 0,
      votesByIdentifier.get(normalize(party.display_name)) ?? 0
    );

  return [...parties].sort((first, second) =>
    getVotes(second) - getVotes(first) || first.display_name.localeCompare(second.display_name, "es")
  );
}

export function matchesPartySearch(party: PartyOptionForOrdering, searchTerm: string): boolean {
  const query = normalize(searchTerm);
  return !query || normalize(party.display_name).includes(query) || normalize(party.party_key).includes(query);
}
