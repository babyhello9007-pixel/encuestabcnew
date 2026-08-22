import { describe, expect, it } from "vitest";
import { matchesPartySearch, sortPartiesByCurrentVote } from "./partyOrdering";

const options = [
  { party_key: "PSOE", display_name: "PSOE" },
  { party_key: "PP", display_name: "Partido Popular" },
  { party_key: "AC", display_name: "Aliança Catalana" },
];

describe("partyOrdering", () => {
  it("ordena por votos actuales y usa el nombre como desempate", () => {
    expect(sortPartiesByCurrentVote(options, [
      { id: "PP", votos: 25 },
      { id: "PSOE", votos: 25 },
      { id: "AC", votos: 4 },
    ]).map(option => option.party_key)).toEqual(["PP", "PSOE", "AC"]);
  });

  it("reconoce claves, nombres y acentos al buscar", () => {
    expect(matchesPartySearch(options[2], "alianza")).toBe(true);
    expect(matchesPartySearch(options[1], "pp")).toBe(true);
    expect(matchesPartySearch(options[0], "vox")).toBe(false);
  });
});
