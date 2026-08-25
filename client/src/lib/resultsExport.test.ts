import { describe, expect, it } from "vitest";
import { buildResultsCsv, buildResultsExcelHtml, type ResultsExportRow } from "./resultsExport";

const rows: ResultsExportRow[] = [{
  partido: "Partido, Demo",
  votos: 1234,
  porcentaje: 42.5,
  escanos: 148,
  barometro: 150,
  media: 145,
}];

const context = {
  titulo: "Resultados Generales",
  respuestas: 1234,
  ccaa: "Madrid",
  provincia: "Madrid",
  edad: "18–30",
  generadoEn: "2026-08-25T00:00:00.000Z",
};

describe("resultsExport", () => {
  it("genera CSV UTF-8 con metadatos, filtros y valores electorales", () => {
    const csv = buildResultsCsv(rows, context);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("Comunidad autónoma,Madrid");
    expect(csv).toContain("Provincia,Madrid");
    expect(csv).toContain('"Partido, Demo"');
    expect(csv).toContain("Escaños EncuestaBC");
    expect(csv).toContain("150");
  });

  it("genera una tabla HTML compatible con Excel y escapa contenido", () => {
    const html = buildResultsExcelHtml([{ ...rows[0], partido: "A < B" }], context);
    expect(html).toContain("<table>");
    expect(html).toContain("Resultados Generales");
    expect(html).toContain("A &lt; B");
    expect(html).toContain("Media de encuestas");
    expect(html).not.toContain("A < B");
  });
});
