export type ResultsPanelPreference = "filters" | "top5" | null;

const STORAGE_KEY = "bc-results-open-panel";

export function readResultsPanelPreference(storage?: Storage): ResultsPanelPreference {
  if (!storage) return null;
  const saved = storage.getItem(STORAGE_KEY);
  return saved === "filters" || saved === "top5" ? saved : null;
}

export function writeResultsPanelPreference(storage: Storage | undefined, panel: ResultsPanelPreference): void {
  if (!storage) return;
  if (panel) storage.setItem(STORAGE_KEY, panel);
  else storage.removeItem(STORAGE_KEY);
}
