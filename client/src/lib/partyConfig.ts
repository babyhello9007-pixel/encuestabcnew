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
    color: "#FF9900",
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
  "SUMAR": {
    color: "#EE5A24",
    logo: "🟠",
    displayName: "SUMAR"
  },

  // Partidos nacionalistas catalanes
  "ERC": {
    color: "#FFD700",
    logo: "🟡",
    displayName: "ERC"
  },
  "Esquerra Republicana de Catalunya": {
    color: "#FFD700",
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
  "Ezker Nazionala": {
    color: "#FF0000",
    logo: "🔴",
    displayName: "Ezker Nazionala"
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

  // Partidos canarios
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
  "UPL": {
    color: "#FFCC00",
    logo: "🟡",
    displayName: "UPL"
  },

  // Otros partidos
  "Frente Obrero": {
    color: "#8B0000",
    logo: "🔴",
    displayName: "Frente Obrero"
  },
  "Se Acabó La Fiesta": {
    color: "#FF1493",
    logo: "🌸",
    displayName: "Se Acabó La Fiesta"
  },
  "SALF": {
    color: "#FF1493",
    logo: "🌸",
    displayName: "Se Acabó La Fiesta"
  },
  "Escaños en Blanco": {
    color: "#808080",
    logo: "⚪",
    displayName: "Escaños en Blanco"
  },
  "Izquierda Española": {
    color: "#FF0000",
    logo: "🔴",
    displayName: "Izquierda Española"
  },
  "Izquierda Unida": {
    color: "#FF0000",
    logo: "🔴",
    displayName: "Izquierda Unida"
  },
  "Caminando Juntos": {
    color: "#9370DB",
    logo: "🟣",
    displayName: "Caminando Juntos"
  },
  "Falange": {
    color: "#8B0000",
    logo: "🔴",
    displayName: "Falange"
  },
  "Falange Española de las JONS": {
    color: "#8B0000",
    logo: "🔴",
    displayName: "Falange Española"
  },
  "Soberanía y Trabajo": {
    color: "#8B0000",
    logo: "🔴",
    displayName: "Soberanía y Trabajo"
  },
  "Soberanía y Trabajo.": {
    color: "#8B0000",
    logo: "🔴",
    displayName: "Soberanía y Trabajo"
  },
  "P-Lib": {
    color: "#FFD700",
    logo: "🟡",
    displayName: "P-Lib"
  },
  "P-lib": {
    color: "#FFD700",
    logo: "🟡",
    displayName: "P-lib"
  },
  "PACMA": {
    color: "#00AA44",
    logo: "🟢",
    displayName: "PACMA"
  },
  "Comunión Tradicionalista": {
    color: "#8B0000",
    logo: "🔴",
    displayName: "Comunión Tradicionalista"
  },
  "CUP": {
    color: "#FF6600",
    logo: "🟠",
    displayName: "CUP"
  },
  "Adelante Andalucía": {
    color: "#FF0000",
    logo: "🔴",
    displayName: "Adelante Andalucía"
  },
  "UPN": {
    color: "#0066CC",
    logo: "🔵",
    displayName: "UPN"
  },
  "Otros": {
    color: "#CCCCCC",
    logo: "⚫",
    displayName: "Otros"
  },

};

/**
 * Obtener configuración de un partido
 * @param partyName Nombre del partido
 * @returns Configuración del partido o configuración por defecto
 */
export function getPartyConfig(partyName: string): PartyConfig {
  // Búsqueda exacta
  if (PARTY_CONFIG[partyName]) {
    return PARTY_CONFIG[partyName];
  }

  // Búsqueda por coincidencia parcial (case-insensitive)
  const lowerName = partyName.toLowerCase();
  for (const [key, config] of Object.entries(PARTY_CONFIG)) {
    if (key.toLowerCase() === lowerName || 
        key.toLowerCase().includes(lowerName) ||
        lowerName.includes(key.toLowerCase())) {
      return config;
    }
  }

  // Configuración por defecto
  return {
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
