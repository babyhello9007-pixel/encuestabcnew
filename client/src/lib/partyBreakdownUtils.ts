export interface PartyMetricsData {
  edad_promedio: number | null;
  ideologia_promedio: number | null;
  total_votos: number;
}

export function uniquePartyCandidates(partyName: string, partyKey?: string) {
  return Array.from(
    new Set(
      [partyKey, partyName]
        .filter((value): value is string => Boolean(value?.trim()))
        .map(value => value.trim()),
    ),
  );
}

export function calculateMetricsFromResponses(rows: Array<{ edad?: unknown; posicion_ideologica?: unknown }>): PartyMetricsData | null {
  if (rows.length === 0) return null;
  const toFiniteNumber = (value: unknown) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const ages = rows.map(row => toFiniteNumber(row.edad)).filter((value): value is number => value !== null);
  const ideologies = rows.map(row => toFiniteNumber(row.posicion_ideologica)).filter((value): value is number => value !== null);
  return {
    edad_promedio: ages.length ? ages.reduce((total, age) => total + age, 0) / ages.length : null,
    ideologia_promedio: ideologies.length ? ideologies.reduce((total, value) => total + value, 0) / ideologies.length : null,
    total_votos: rows.length,
  };
}
