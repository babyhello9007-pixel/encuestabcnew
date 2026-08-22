import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ProvincesResultsSection: orden de hooks", () => {
  it("crea el índice canónico antes del retorno condicional de carga", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/ProvincesResultsSection.tsx"),
      "utf8",
    );

    const partyIndexHook = source.indexOf("const partyIndex = useMemo");
    const loadingReturn = source.indexOf("if (loading) {");

    expect(partyIndexHook).toBeGreaterThan(-1);
    expect(loadingReturn).toBeGreaterThan(-1);
    expect(partyIndexHook).toBeLessThan(loadingReturn);
  });
});
