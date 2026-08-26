import { describe, expect, it } from "vitest";
import { buildElectoralPdfRows } from "./electoralSummaryPdf";
import { readExportFormatPreference, writeExportFormatPreference } from "./exportFormatPreference";

describe("exportFormatPreference", () => {
  it("usa PDF como valor seguro y persiste un formato válido", () => {
    const storage = new Map<string, string>();
    const adapter = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    };

    expect(readExportFormatPreference(adapter)).toBe("pdf");
    writeExportFormatPreference(adapter, "png");
    expect(readExportFormatPreference(adapter)).toBe("png");
    writeExportFormatPreference(adapter, null);
    expect(readExportFormatPreference(adapter)).toBe("pdf");
  });
});

describe("buildElectoralPdfRows", () => {
  it("ordena por votos y conserva las medias electorales y del líder", () => {
    const rows = buildElectoralPdfRows([
      { partido: "PSOE", votos: 20, porcentaje: 20, escanos: 70, barometro: 100, mediaEncuestas: 95, edadMedia: 38.4, lider: "Pedro Sánchez", apoyoLider: 61.2 },
      { partido: "PP", votos: 30, porcentaje: 30, escanos: 120, barometro: 115, mediaEncuestas: 110, edadMedia: 41.1, lider: "Alberto Núñez Feijóo", apoyoLider: 57.8 },
    ]);

    expect(rows[0]).toEqual(["1", "PP", "30", "30.00%", "120", "115", "110", "41.1 años", "Alberto Núñez Feijóo", "57.8%"]);
    expect(rows[1][5]).toBe("100");
    expect(rows[1][6]).toBe("95");
  });
});
