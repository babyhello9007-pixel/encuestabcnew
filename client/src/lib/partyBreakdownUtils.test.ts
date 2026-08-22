import { describe, expect, it } from "vitest";
import { calculateMetricsFromResponses, uniquePartyCandidates } from "./partyBreakdownUtils";

describe("desglose de resultados por partido", () => {
  it("consulta tanto la clave como el nombre visible del partido sin duplicados", () => {
    expect(uniquePartyCandidates("Partido Popular", "PP")).toEqual(["PP", "Partido Popular"]);
    expect(uniquePartyCandidates("PP", "PP")).toEqual(["PP"]);
  });

  it("agrega solo valores demográficos y de ideología válidos de respuestas reales", () => {
    expect(calculateMetricsFromResponses([
      { edad: "20", posicion_ideologica: 3 },
      { edad: 40, posicion_ideologica: "7" },
      { edad: "sin dato", posicion_ideologica: null },
    ])).toEqual({ edad_promedio: 30, ideologia_promedio: 5, total_votos: 3 });
  });

  it("devuelve null si no existen respuestas para el partido", () => {
    expect(calculateMetricsFromResponses([])).toBeNull();
  });
});
