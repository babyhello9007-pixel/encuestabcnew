export interface RuntimePartyEntry {
  key: string;
  displayName: string;
  color: string;
  logoUrl: string;
  partyType: 'general' | 'youth';
}

const STORAGE_KEY = 'bc_party_runtime_config_v1';

export function setRuntimePartyConfig(rows: RuntimePartyEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function getRuntimePartyConfig(): RuntimePartyEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function findRuntimePartyConfigByNameOrKey(value: string): RuntimePartyEntry | null {
  if (!value) return null;
  const needle = value.toLowerCase().trim();
  const list = getRuntimePartyConfig();
  return (
    list.find((item) => item.key.toLowerCase() === needle) ||
    list.find((item) => item.displayName.toLowerCase() === needle) ||
    null
  );
}
