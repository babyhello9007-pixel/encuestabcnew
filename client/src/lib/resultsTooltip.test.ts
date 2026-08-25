import { describe, expect, it } from "vitest";
import { formatExactVoteTooltip } from "./resultsTooltip";

describe("formatExactVoteTooltip", () => {
  it("explica el porcentaje con el número exacto de votos", () => {
    expect(formatExactVoteTooltip(1234, 12.5)).toBe("12,5% del ámbito equivale a 1234 votos");
  });

  it("normaliza valores no numéricos de forma segura", () => {
    expect(formatExactVoteTooltip(Number.NaN, Number.NaN)).toBe("0,0% del ámbito equivale a 0 votos");
  });
});
