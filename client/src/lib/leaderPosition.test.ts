import { describe, expect, it } from "vitest";
import { compareLeaderPositions } from "./leaderPosition";

describe("compareLeaderPositions", () => {
  it("detecta subidas y bajadas entre actualizaciones", () => {
    const result = compareLeaderPositions(
      ["Líder A", "Líder B", "Líder C"],
      ["Líder B", "Líder C", "Líder A"]
    );

    expect(result["líder b"]).toMatchObject({ movement: "up", delta: 1, previousPosition: 2, currentPosition: 1 });
    expect(result["líder a"]).toMatchObject({ movement: "down", delta: -2, previousPosition: 1, currentPosition: 3 });
    expect(result["líder c"]).toMatchObject({ movement: "up", delta: 1, previousPosition: 3, currentPosition: 2 });
  });

  it("marca como nuevos los líderes incorporados", () => {
    const result = compareLeaderPositions(["Líder A"], ["Líder A", "Líder B"]);
    expect(result["líder b"]).toMatchObject({ movement: "new", previousPosition: null, currentPosition: 2, delta: 0 });
  });

  it("mantiene el estado same cuando no cambia la posición", () => {
    const result = compareLeaderPositions(["Líder A"], ["líder a"]);
    expect(result["líder a"]).toMatchObject({ movement: "same", delta: 0, previousPosition: 1, currentPosition: 1 });
  });
});
