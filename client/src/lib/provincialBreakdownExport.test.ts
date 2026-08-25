import { describe, expect, it } from "vitest";
import {
  buildProvincialBreakdownCsv,
  createProvincialBreakdownPdf,
  type ProvincialBreakdownExportContext,
  type ProvincialBreakdownExportRow,
} from "./provincialBreakdownExport";

const context: ProvincialBreakdownExportContext = {
  titulo: "Desglose provincial · Elecciones Generales",
  respuestas: 42,
  ambito: "Comunidad de Madrid",
  generadoEn: "2026-08-25T12:00:00.000Z",
};

const rows: ProvincialBreakdownExportRow[] = [
  {
    ccaa: "Comunidad de Madrid",
    provincia: "Madrid",
    cupoEscanos: 37,
    votos: 42,
    porcentajeVoto: 100,
    escanosAsignados: 37,
    partidos: "PP: 18 · PSOE: 10 · VOX: 9",
  },
];

describe("provincialBreakdownExport", () => {
  it("genera un CSV con el cupo provincial y el reparto completo", () => {
    const csv = buildProvincialBreakdownCsv(rows, context);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("Comunidad autónoma,Provincia,Cupo provincial,Votos válidos,% del ámbito,Escaños asignados,Partidos y escaños");
    expect(csv).toContain("Comunidad de Madrid,Madrid,37,42,\"100,0\",37");
    expect(csv).toContain("PP: 18 · PSOE: 10 · VOX: 9");
    expect(csv).toContain("% del ámbito");
    expect(csv).toContain("2026-08-25T12:00:00.000Z");
  });

  it("crea un PDF paginado con el informe provincial", () => {
    const doc = createProvincialBreakdownPdf(rows, context);
    const output = doc.output("arraybuffer");

    expect(doc.getNumberOfPages()).toBe(1);
    expect(output.byteLength).toBeGreaterThan(500);
  });
});
