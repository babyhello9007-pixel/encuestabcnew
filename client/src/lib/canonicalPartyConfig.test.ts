import { describe, expect, it } from "vitest";
import {
  createCanonicalPartyIndex,
  resolveCanonicalParty,
  resolveCanonicalPartyFromReferences,
  sanitizePartyColor,
} from "./canonicalPartyConfig";

const index = createCanonicalPartyIndex([
  { party_key: "UPN", display_name: "Unión del Pueblo Navarro", color: "#00000", logo_url: "https://cdn.example/upn.png" },
  { party_key: "Se Acabó La Fiesta", display_name: "Se Acabó la Fiesta", color: "#f59e0b", logo_url: "https://cdn.example/salf.png" },
  { party_key: "Alianca Catalana", display_name: "Aliança Catalana", color: "#1d4ed8", logo_url: "https://cdn.example/alianca.png" },
]);

describe("canonicalPartyConfig", () => {
  it("resuelve key, nombre visible, acentos y capitalización contra party_configuration", () => {
    expect(resolveCanonicalParty("Unión del Pueblo Navarro", index)?.party_key).toBe("UPN");
    expect(resolveCanonicalParty("se acabó la fiesta", index)?.party_key).toBe("Se Acabó La Fiesta");
    expect(resolveCanonicalParty("ALIÀNÇA CATALANA", index)?.display_name).toBe("Aliança Catalana");
  });

  it("prioriza party_key antes que display_name y devuelve exclusivamente el branding de la tabla", () => {
    expect(resolveCanonicalPartyFromReferences(["UPN", "Nombre ajeno"], index)).toEqual({
      party_key: "UPN",
      display_name: "Unión del Pueblo Navarro",
      color: "#000000",
      logo_url: "https://cdn.example/upn.png",
    });
  });

  it("corrige el color hexadecimal malformado que bloqueaba Canvas", () => {
    expect(sanitizePartyColor("#00000")).toBe("#000000");
  });
});
