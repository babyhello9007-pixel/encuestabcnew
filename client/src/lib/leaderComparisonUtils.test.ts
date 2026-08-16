import { describe, expect, it } from "vitest";
import { calculateComparisonDifference, getFavoritesForLeader } from "./leaderComparisonUtils";

describe("leaderComparisonUtils", () => {
  it("calcula la diferencia porcentual exacta respecto al líder comparado", () => {
    expect(calculateComparisonDifference(8, 6)).toBeCloseTo(33.333, 3);
    expect(calculateComparisonDifference(5, 6)).toBeCloseTo(-16.667, 3);
  });

  it("no intenta calcular una diferencia cuando el promedio comparado no es válido", () => {
    expect(calculateComparisonDifference(8, null)).toBeNull();
    expect(calculateComparisonDifference(8, 0)).toBeNull();
  });

  it("solo recupera favoritos del líder actualmente abierto", () => {
    const favorites = [
      { leaderName: "Líder A", label: "A" },
      { leaderName: "Líder B", label: "B" },
      { leaderName: "Líder A", label: "A reciente" },
    ];

    expect(getFavoritesForLeader(favorites, "Líder A")).toHaveLength(2);
    expect(getFavoritesForLeader(favorites, "Líder B")[0].label).toBe("B");
  });
});
