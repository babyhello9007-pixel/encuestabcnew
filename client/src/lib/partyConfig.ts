/**
 * Configuración de colores oficiales y logos de partidos políticos españoles
 */

export interface PartyConfig {
  color: string;
  logo: string;
  displayName: string;
}

export const PARTY_CONFIG: Record<string, PartyConfig> = {
  // Partidos principales
  "VOX": {
    color: "#24AA3D",
    logo: "🟢",
    displayName: "VOX"
  },
  "PP": {
    color: "#0066CC",
    logo: "🔵",
    displayName: "PP"
  },
  "PSOE": {
    color: "#E81828",
    logo: "🔴",
    displayName: "PSOE"
  },
  "Ciudadanos": {
    color: "#FF6600",
    logo: "🟠",
    displayName: "Ciudadanos"
  },
  "PODEMOS": {
    color: "#9B2D96",
    logo: "🟣",
    displayName: "PODEMOS"
  },
  "Unidas Podemos": {
    color: "#9B2D96",
    logo: "🟣",
    displayName: "Unidas Podemos"
  },
  "UP": {
    color: "#9B2D96",
    logo: "🟣",
    displayName: "UP"
  },

  // Partidos nacionalistas catalanes
  "ERC": {
    color: "#FFCC00",
    logo: "🟡",
    displayName: "ERC"
  },
  "Esquerra Republicana de Catalunya": {
    color: "#FFCC00",
    logo: "🟡",
    displayName: "ERC"
  },
  "JUNTS": {
    color: "#003D99",
    logo: "🔷",
    displayName: "JUNTS"
  },
  "Junts per Catalunya": {
    color: "#003D99",
    logo: "🔷",
    displayName: "JUNTS"
  },
  "Aliança Catalana": {
    color: "#003D99",
    logo: "🔷",
    displayName: "Aliança Catalana"
  },

  // Partidos nacionalistas vascos
  "PNV": {
    color: "#00AA44",
    logo: "🟢",
    displayName: "PNV"
  },
  "Partido Nacionalista Vasco": {
    color: "#00AA44",
    logo: "🟢",
    displayName: "PNV"
  },
  "BILDU": {
    color: "#FF0000",
    logo: "🔴",
    displayName: "BILDU"
  },
  "EH Bildu": {
    color: "#FF0000",
    logo: "🔴",
    displayName: "EH Bildu"
  },

  // Partidos nacionalistas gallegos
  "BNG": {
    color: "#0099FF",
    logo: "🔵",
    displayName: "BNG"
  },
  "Bloque Nacionalista Galego": {
    color: "#0099FF",
    logo: "🔵",
    displayName: "BNG"
  },

  // Otros partidos
  "SUMAR": {
    color: "#FF00FF",
    logo: "🟣",
    displayName: "SUMAR"
  },
  "Coalición Canaria": {
    color: "#FFCC00",
    logo: "🟡",
    displayName: "Coalición Canaria"
  },
  "CC": {
    color: "#FFCC00",
    logo: "🟡",
    displayName: "CC"
  },
  "Frente Obrero": {
    color: "#FF0000",
    logo: "🔴",
    displayName: "Frente Obrero"
  },
  "Se Acabó La Fiesta": {
    color: "#FF6600",
    logo: "🟠",
    displayName: "Se Acabó La Fiesta"
  },
  "SALF": {
    color: "#FF6600",
    logo: "🟠",
    displayName: "Se Acabó La Fiesta"
  },
  "Escaños en Blanco": {
    color: "#999999",
    logo: "⚪",
    displayName: "Escaños en Blanco"
  },
  "Izquierda Española": {
    color: "#FF0000",
    logo: "🔴",
    displayName: "Izquierda Española"
  },
  "Caminando Juntos": {
    color: "#0099FF",
    logo: "🔵",
    displayName: "Caminando Juntos"
  },
  "Falange Española de las JONS": {
    color: "#0066CC",
    logo: "🔵",
    displayName: "Falange Española"
  },
  "Soberanía y Trabajo": {
    color: "#FF0000",
    logo: "🔴",
    displayName: "Soberanía y Trabajo"
  },
  "P-Lib": {
    color: "#FFD700",
    logo: "🟡",
    displayName: "P-Lib"
  },
  "Otros": {
    color: "#CCCCCC",
    logo: "⚫",
    displayName: "Otros"
  },
  "OTROS_VOTOS": {
    color: "#CCCCCC",
    logo: "⚫",
    displayName: "Otros"
  }
};

/**
 * Obtener configuración de un partido
 * @param partyName Nombre del partido
 * @returns Configuración del partido o configuración por defecto
 */
export function getPartyConfig(partyName: string): PartyConfig {
  return PARTY_CONFIG[partyName] || {
    color: "#999999",
    logo: "⚫",
    displayName: partyName
  };
}

/**
 * Obtener color de un partido
 * @param partyName Nombre del partido
 * @returns Color del partido
 */
export function getPartyColor(partyName: string): string {
  return getPartyConfig(partyName).color;
}

/**
 * Obtener logo de un partido
 * @param partyName Nombre del partido
 * @returns Logo del partido
 */
export function getPartyLogo(partyName: string): string {
  return getPartyConfig(partyName).logo;
}
