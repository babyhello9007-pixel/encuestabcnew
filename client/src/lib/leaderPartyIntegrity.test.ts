import { describe, expect, it } from "vitest";
import { canonicalizeLeaderPreferences } from "./leaderPartyIntegrity";

describe("leaderPartyIntegrity", () => {
  const leaders = [
    { party_key: "PP", display_name: "Partido Popular", leader_name: "Ana López", photo_url: "ana.jpg", color: "#123456", logo_url: "pp.svg" },
    { party_key: "PSOE", display_name: "PSOE", leader_name: "Ana López", photo_url: "ana-psoe.jpg", color: "#ef4444", logo_url: "psoe.svg" },
  ];

  it("canonicaliza por partido y no cruza homónimos", () => {
    expect(canonicalizeLeaderPreferences([
      { partido: "Partido Popular", lider_preferido: "Ana López", total_votos: 4, porcentaje: 80 },
      { partido: "PSOE", lider_preferido: "Ana López", total_votos: 1, porcentaje: 20 },
    ], leaders)).toEqual([
      expect.objectContaining({ partido: "PP", lider_preferido: "Ana López", photo_url: "ana.jpg" }),
      expect.objectContaining({ partido: "PSOE", lider_preferido: "Ana López", photo_url: "ana-psoe.jpg" }),
    ]);
  });

  it("descarta partidos o líderes que no estén configurados", () => {
    expect(canonicalizeLeaderPreferences([
      { partido: "PP", lider_preferido: "Líder no configurado", total_votos: 7 },
      { partido: "Partido inexistente", lider_preferido: "Ana López", total_votos: 3 },
    ], leaders)).toEqual([]);
  });
});
