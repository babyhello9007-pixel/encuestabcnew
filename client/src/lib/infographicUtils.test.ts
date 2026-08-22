import { describe, expect, it } from "vitest";
import {
  getTopRegionsByParty,
  normalizeInfographicColor,
  withInfographicAlpha,
} from "./infographicUtils";

describe("infographicUtils", () => {
  it("normaliza colores hexadecimales admitidos para Canvas", () => {
    expect(normalizeInfographicColor("#1a2")).toBe("#11AA22");
    expect(normalizeInfographicColor("aa10ff")).toBe("#AA10FF");
    expect(normalizeInfographicColor("#11223388")).toBe("#112233");
  });

  it("aplica un color de respaldo para valores inválidos", () => {
    expect(normalizeInfographicColor("#00000")).toBe("#C41E3A");
    expect(withInfographicAlpha("#00000")).toBe("#C41E3A88");
  });

  it("calcula la región con más respuestas sin requerir una vista SQL", () => {
    expect(getTopRegionsByParty([
      { voto_generales: "PP", comunidad_autonoma: "Madrid" },
      { voto_generales: "PP", comunidad_autonoma: "Madrid" },
      { voto_generales: "PP", comunidad_autonoma: "Galicia" },
      { voto_generales: "PSOE", comunidad_autonoma: "Andalucía" },
      { voto_generales: "PSOE", comunidad_autonoma: "Andalucía" },
      { voto_generales: "PSOE", comunidad_autonoma: "Madrid" },
      { voto_generales: "", comunidad_autonoma: "Madrid" },
    ])).toEqual([
      { partido: "PP", region: "Madrid", votos: 2 },
      { partido: "PSOE", region: "Andalucía", votos: 2 },
    ]);
  });
});
