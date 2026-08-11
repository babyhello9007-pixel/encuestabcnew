import { describe, expect, it } from "vitest";
import { buildLeaderRanking } from "./leaderRankingCore";

describe("buildLeaderRanking", () => {
  it("calcula medias ponderadas y ordena con el mismo desempate siempre", () => {
    const ranking = buildLeaderRanking(
      [
        {
          party_key: "PP",
          leader_name: "Ester Muñoz",
          media_valoracion: 8.8,
          total_valoraciones: 10,
        },
        {
          party_key: "PSOE",
          leader_name: "Ester Muñoz",
          media_valoracion: 9.5,
          total_valoraciones: 2,
        },
        {
          party_key: "VOX",
          leader_name: "Otro Líder",
          media_valoracion: 8.9,
          total_valoraciones: 20,
        },
        {
          party_key: "SUMAR",
          leader_name: "Tercer Líder",
          media_valoracion: 7.1,
          total_valoraciones: 3,
        },
      ],
      [
        {
          party_key: "PP",
          leader_name: "Ester Muñoz",
          photo_url: "/ester.jpg",
          party_configuration: {
            display_name: "Partido Popular",
            color: "#1d4ed8",
            logo_url: "/pp.svg",
          },
        },
        {
          party_key: "PSOE",
          leader_name: "Ester Muñoz",
          photo_url: "/ester.jpg",
          party_configuration: {
            display_name: "PSOE",
            color: "#ef4444",
            logo_url: "/psoe.svg",
          },
        },
        {
          party_key: "VOX",
          leader_name: "Otro Líder",
          photo_url: "/otro.jpg",
          party_configuration: {
            display_name: "VOX",
            color: "#16a34a",
            logo_url: "/vox.svg",
          },
        },
        {
          party_key: "SUMAR",
          leader_name: "Tercer Líder",
          photo_url: "/tercero.jpg",
          party_configuration: {
            display_name: "SUMAR",
            color: "#f97316",
            logo_url: "/sumar.svg",
          },
        },
      ]
    );

    expect(ranking[0].leader_name).toBe("Ester Muñoz");
    expect(ranking[0].media_valoracion).toBeCloseTo((8.8 * 10 + 9.5 * 2) / 12, 10);
    expect(ranking[0].total_valoraciones).toBe(12);
    expect(ranking[0].parties.map((party) => party.party_key)).toEqual(["PP", "PSOE"]);
    const topFive = ranking.slice(0, 5);
    expect(topFive[0]).toMatchObject({
      leader_name: "Ester Muñoz",
      total_valoraciones: 12,
    });
  });

  it("usa el nombre como desempate final para que el orden sea determinista", () => {
    const ranking = buildLeaderRanking(
      [
        { party_key: "A", leader_name: "Zeta", media_valoracion: 8, total_valoraciones: 1 },
        { party_key: "B", leader_name: "Alfa", media_valoracion: 8, total_valoraciones: 1 },
      ],
      []
    );

    expect(ranking.map((leader) => leader.leader_name)).toEqual(["Alfa", "Zeta"]);
  });
});
