import { describe, expect, it } from "vitest";
import { consolidateLeaders, getLeaderIdentityKey } from "./leaderIdentity";

describe("leaderIdentity", () => {
  it("normaliza tildes, espacios y mayúsculas al reconocer una persona", () => {
    expect(getLeaderIdentityKey("  SÍLVIA   ORRIOLS ")).toBe("silvia orriols");
  });

  it("muestra una sola tarjeta por persona aunque figure en varios partidos", () => {
    const leaders = consolidateLeaders([
      { id: 7, party_key: "AC", leader_name: "Sílvia Orriols", photo_url: "", display_name: "Aliança Catalana", color: "#123456", logo_url: "" },
      { id: 4, party_key: "OTRO", leader_name: "Silvia Orriols", photo_url: "/silvia.jpg", display_name: "Otro", color: "#654321", logo_url: "" },
      { id: 8, party_key: "PP", leader_name: "Alberto Núñez Feijóo", photo_url: null, display_name: "Partido Popular", color: "#0055AA", logo_url: "" },
    ]);

    expect(leaders).toHaveLength(2);
    expect(leaders.find(leader => leader.identity_key === "silvia orriols")).toMatchObject({
      party_key: "OTRO",
      photo_url: "/silvia.jpg",
      affiliations: [
        { party_key: "OTRO" },
        { party_key: "AC" },
      ],
    });
  });
});
