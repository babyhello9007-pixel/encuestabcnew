/**
 * party_configuration es la única fuente de identidad visual de partidos.
 * Las vistas de resultados solo aportan datos electorales y pueden usar una
 * key o el display_name como referencia a esta configuración.
 */
export interface CanonicalPartyConfigRow {
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
  is_active?: boolean | null;
  party_type?: string;
}

export interface CanonicalPartyBrand {
  party_key: string;
  display_name: string;
  color: string;
  logo_url: string;
}

export interface CanonicalPartyIndex {
  byKey: Map<string, CanonicalPartyConfigRow>;
  byDisplayName: Map<string, CanonicalPartyConfigRow>;
}

export function normalizePartyReference(value?: string | null): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es-ES");
}

/** Corrige el único formato defectuoso detectado sin cambiar la identidad del partido. */
export function sanitizePartyColor(value?: string | null, fallback = "#64748B"): string {
  const color = String(value || "").trim();
  if (color === "#00000") return "#000000";
  if (/^#[\da-fA-F]{6}$/.test(color)) return color;
  if (/^#[\da-fA-F]{3}$/.test(color)) {
    return `#${color.slice(1).split("").map((char) => `${char}${char}`).join("")}`;
  }
  return fallback;
}

export function createCanonicalPartyIndex(rows: CanonicalPartyConfigRow[]): CanonicalPartyIndex {
  const byKey = new Map<string, CanonicalPartyConfigRow>();
  const byDisplayName = new Map<string, CanonicalPartyConfigRow>();

  rows.forEach((row) => {
    const partyKey = normalizePartyReference(row.party_key);
    const displayName = normalizePartyReference(row.display_name);
    if (partyKey) byKey.set(partyKey, row);
    if (displayName) byDisplayName.set(displayName, row);
  });

  return { byKey, byDisplayName };
}

export function resolveCanonicalParty(
  reference: string | null | undefined,
  index: CanonicalPartyIndex,
): CanonicalPartyBrand | null {
  const normalized = normalizePartyReference(reference);
  if (!normalized) return null;

  const party = index.byKey.get(normalized) || index.byDisplayName.get(normalized);
  if (!party) return null;

  return {
    party_key: party.party_key,
    display_name: party.display_name,
    color: sanitizePartyColor(party.color),
    logo_url: String(party.logo_url || "").trim(),
  };
}

export function resolveCanonicalPartyFromReferences(
  references: Array<string | null | undefined>,
  index: CanonicalPartyIndex,
): CanonicalPartyBrand | null {
  for (const reference of references) {
    const result = resolveCanonicalParty(reference, index);
    if (result) return result;
  }
  return null;
}
