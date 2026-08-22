import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readComponent = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), "client/src/components", relativePath), "utf8");

describe("fuentes canónicas de resultados territoriales", () => {
  const components = [
    "ProvincesResultsSection.tsx",
    "CCAAResltsSection.tsx",
    "CCAAComparisonSection.tsx",
    "results/PreguntasVariasSection.tsx",
  ];

  it.each(components)("%s consulta party_configuration y resuelve identidad canónica", (component) => {
    const source = readComponent(component);
    expect(source).toContain("party_configuration");
    expect(source).toMatch(/createCanonicalPartyIndex|resolveCanonicalParty/);
  });

  it.each(components)("%s no recibe partyMeta heredado", (component) => {
    expect(readComponent(component)).not.toContain("partyMeta");
  });
});
