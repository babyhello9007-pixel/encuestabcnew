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

  it.each(components)("%s recibe el índice canónico de Results.tsx y resuelve identidad canónica", (component) => {
    const source = readComponent(component);
    expect(source).toMatch(/partyIndex: CanonicalPartyIndex|partyIndex\?: CanonicalPartyIndex/);
    expect(source).toMatch(/resolveCanonicalParty|resolveCanonicalPartyFromReferences/);
  });

  it("Results.tsx consulta una sola fuente canónica de partidos y líderes para las secciones territoriales", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Results.tsx"), "utf8");
    expect(source).toContain('from("party_configuration")');
    expect(source).toContain('from("party_leaders")');
    expect(source).toContain("partyIndex={canonicalPartyIndex}");
  });

  it.each(components)("%s no recibe partyMeta heredado", (component) => {
    expect(readComponent(component)).not.toContain("partyMeta");
  });
});
