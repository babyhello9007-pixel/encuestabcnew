import { describe, expect, it } from "vitest";
import { readResultsPanelPreference, writeResultsPanelPreference } from "./resultsPanelPreference";

function createStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
}

describe("resultsPanelPreference", () => {
  it("persiste y recupera un panel válido", () => {
    const storage = createStorage();
    writeResultsPanelPreference(storage, "top5");
    expect(readResultsPanelPreference(storage)).toBe("top5");
  });

  it("ignora valores inválidos y elimina la preferencia al cerrar", () => {
    const storage = createStorage();
    storage.setItem("bc-results-open-panel", "invalid");
    expect(readResultsPanelPreference(storage)).toBeNull();
    writeResultsPanelPreference(storage, "filters");
    writeResultsPanelPreference(storage, null);
    expect(readResultsPanelPreference(storage)).toBeNull();
  });
});
