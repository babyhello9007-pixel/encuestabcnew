import { aggregatePartyLeaderRatings } from "./leaderRatingAggregation";
import { describe, expect, it } from "vitest";

describe("aggregatePartyLeaderRatings", () => {
  it("mantiene separados a líderes homónimos de partidos distintos y descarta filas inválidas", () => {
    const grouped = aggregatePartyLeaderRatings([
      { party_key: "PP", leader_name: "Alex García", valoracion: 9 },
      { party_key: "PP", leader_name: "Alex García", valoracion: 7 },
      { party_key: "PSOE", leader_name: "Alex García", valoracion: 10 },
      { party_key: "", leader_name: "Sin partido", valoracion: 10 },
      { party_key: "VOX", leader_name: "Sin nota", valoracion: null },
    ]);

    expect(grouped).toEqual(expect.arrayContaining([
      { party_key: "PP", leader_name: "Alex García", total: 2, score: 16 },
      { party_key: "PSOE", leader_name: "Alex García", total: 1, score: 10 },
    ]));
    expect(grouped).toHaveLength(2);
  });
});
