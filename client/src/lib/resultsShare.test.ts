import { describe, expect, it } from "vitest";
import { buildResultsSharePayload } from "./resultsShare";

describe("buildResultsSharePayload", () => {
  it("genera un enlace estable con el tab seleccionado y el total localizado", () => {
    const payload = buildResultsSharePayload("https://encuestabc.example/", "general", 1234);

    expect(payload.title).toBe("Resultados · Batalla Cultural");
    expect(payload.text).toMatch(/(?:1\.234|1234) respuestas/);
    expect(payload.url).toBe("https://encuestabc.example/resultados?tab=general");
  });

  it("codifica tabs con caracteres especiales y evita dobles barras", () => {
    const payload = buildResultsSharePayload("https://encuestabc.example///", "lideres partidos", 0);

    expect(payload.url).toBe("https://encuestabc.example/resultados?tab=lideres+partidos");
  });
});
