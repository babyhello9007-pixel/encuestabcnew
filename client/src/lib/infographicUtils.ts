export const INFOGRAPHIC_FALLBACK_COLOR = "#C41E3A";

export function normalizeInfographicColor(
  value: unknown,
  fallback = INFOGRAPHIC_FALLBACK_COLOR
): string {
  const candidate = String(value ?? "").trim();
  const match = candidate.match(/^#?([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i);

  if (!match) return fallback;

  const hex = match[1];
  if (hex.length === 3) {
    return `#${hex.split("").map(character => character + character).join("")}`.toUpperCase();
  }

  // Canvas acepta ocho dígitos, pero la infografía añade su propia opacidad
  // para las barras. Conservamos únicamente la parte RGB en ese caso.
  return `#${hex.slice(0, 6)}`.toUpperCase();
}

export function withInfographicAlpha(color: unknown, alpha = "88"): string {
  const normalizedAlpha = /^[\da-f]{2}$/i.test(alpha) ? alpha.toUpperCase() : "88";
  return `${normalizeInfographicColor(color)}${normalizedAlpha}`;
}

export interface RegionResponseRow {
  voto_generales?: string | null;
  comunidad_autonoma?: string | null;
}

export interface TopRegionByParty {
  partido: string;
  region: string;
  votos: number;
}

export function getTopRegionsByParty(rows: RegionResponseRow[]): TopRegionByParty[] {
  const countsByParty = new Map<string, Map<string, number>>();

  rows.forEach(row => {
    const party = String(row.voto_generales ?? "").trim();
    const region = String(row.comunidad_autonoma ?? "").trim();
    if (!party || !region) return;

    const regionalCounts = countsByParty.get(party) ?? new Map<string, number>();
    regionalCounts.set(region, (regionalCounts.get(region) ?? 0) + 1);
    countsByParty.set(party, regionalCounts);
  });

  return Array.from(countsByParty.entries())
    .map(([partido, regionalCounts]) => {
      const [region, votos] = Array.from(regionalCounts.entries())
        .sort(([firstRegion, firstVotes], [secondRegion, secondVotes]) =>
          secondVotes - firstVotes || firstRegion.localeCompare(secondRegion, "es")
        )[0];
      return { partido, region, votos };
    })
    .sort((first, second) => second.votos - first.votos || first.partido.localeCompare(second.partido, "es"));
}
