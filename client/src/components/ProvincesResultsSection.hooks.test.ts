import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("ProvincesResultsSection: orden de hooks", () => {
  it("declara todos sus hooks antes del retorno condicional de carga", () => {
    const source = readFileSync(
      resolve(process.cwd(), "client/src/components/ProvincesResultsSection.tsx"),
      "utf8",
    );

    const loadingReturn = source.indexOf("if (loading) {");
    const lastStateHook = source.lastIndexOf("useState", loadingReturn);
    const lastEffectHook = source.lastIndexOf("useEffect", loadingReturn);

    expect(loadingReturn).toBeGreaterThan(-1);
    expect(lastStateHook).toBeGreaterThan(-1);
    expect(lastEffectHook).toBeGreaterThan(-1);
    expect(lastStateHook).toBeLessThan(loadingReturn);
    expect(lastEffectHook).toBeLessThan(loadingReturn);
  });
});
