import { describe, expect, it } from "vitest";
import { buildElectoralPdfExtras } from "./electoralPdfExtras";

describe("buildElectoralPdfExtras", () => {
  it("ordena regiones por respuestas y calcula porcentajes del conjunto territorial", () => {
    const result = buildElectoralPdfExtras([
      { comunidad_autonoma: "Andalucía", voto_generales: "PP" },
      { comunidad_autonoma: "Madrid", voto_generales: "PP" },
      { comunidad_autonoma: "Andalucía", voto_generales: "PSOE" },
    ]);
    expect(result.topRegions).toEqual([
      { region: "Andalucía", votos: 2, porcentaje: (2 / 3) * 100 },
      { region: "Madrid", votos: 1, porcentaje: (1 / 3) * 100 },
    ]);
  });

  it("agrega transferencias origen-destino sin inventar flujos", () => {
    const result = buildElectoralPdfExtras([
      { anteriores_eegg: "PP", voto_generales: "PP" },
      { anteriores_eegg: "PP", voto_generales: "PSOE" },
      { anteriores_eegg: "PP", voto_generales: "PSOE" },
      { anteriores_eegg: "VOX", voto_generales: "PP" },
      { anteriores_eegg: null, voto_generales: "PP" },
    ]);
    expect(result.sankeyFlows).toEqual([
      { origen: "PP", destino: "PSOE", votos: 2 },
      { origen: "PP", destino: "PP", votos: 1 },
      { origen: "VOX", destino: "PP", votos: 1 },
    ]);
  });
});
