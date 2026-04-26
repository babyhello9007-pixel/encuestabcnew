/**
 * Configuración de colores oficiales y logos de partidos políticos españoles
 * Logos reales en lugar de emojis para mejor visualización
 */
import { findRuntimePartyConfigByNameOrKey } from './partyRuntimeConfig';

export interface PartyConfig {
  color: string;
  logo: string;
  displayName: string;
}

export const PARTY_CONFIG: Record<string, PartyConfig> = {
  // Partidos principales
  "VOX": {
    color: "#24AA3D",
    logo: "/assets/icons/VOX.png",
    displayName: "VOX"
  },
  "PP": {
    color: "#0066CC",
    logo: "/assets/icons/PP.png",
    displayName: "PP"
  },
  "PSOE": {
    color: "#E81828",
    logo: "/assets/icons/PSOE.png",
    displayName: "PSOE"
  },
  "Ciudadanos": {
    color: "#FF9900",
    logo: "/assets/icons/Ciudadanos.png",
    displayName: "Ciudadanos"
  },
  "PODEMOS": {
    color: "#9B2D96",
    logo: "/assets/icons/PODEMOS.png",
    displayName: "PODEMOS"
  },
  "Unidas Podemos": {
    color: "#9B2D96",
    logo: "/assets/icons/PODEMOS.png",
    displayName: "Unidas Podemos"
  },
  "UP": {
    color: "#9B2D96",
    logo: "/assets/icons/PODEMOS.png",
    displayName: "UP"
  },
  "SUMAR": {
    color: "#EE5A24",
    logo: "/assets/icons/SUMAR.png",
    displayName: "SUMAR"
  },

  // Partidos nacionalistas catalanes
  "ERC": {
    color: "#FFD700",
    logo: "/assets/icons/ERC.png",
    displayName: "ERC"
  },
  "Esquerra Republicana de Catalunya": {
    color: "#FFD700",
    logo: "/assets/icons/ERC.png",
    displayName: "ERC"
  },
  "JUNTS": {
    color: "#003D99",
    logo: "/assets/icons/JUNTS.png",
    displayName: "JUNTS"
  },
  "Junts per Catalunya": {
    color: "#003D99",
    logo: "/assets/icons/JUNTS.png",
    displayName: "JUNTS"
  },
  "Aliança Catalana": {
    color: "#003D99",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/LSGJuMLqKLfIuSBC.png",
    displayName: "Aliança Catalana"
  },

  // Partidos nacionalistas vascos
  "PNV": {
    color: "#00AA44",
    logo: "/assets/icons/PNV.png",
    displayName: "PNV"
  },
  "Partido Nacionalista Vasco": {
    color: "#00AA44",
    logo: "/assets/icons/PNV.png",
    displayName: "PNV"
  },
  "BILDU": {
    color: "#FF0000",
    logo: "/assets/icons/BILDU.png",
    displayName: "BILDU"
  },
  "EH Bildu": {
    color: "#FF0000",
    logo: "/assets/icons/BILDU.png",
    displayName: "EH Bildu"
  },
  "Ezker Nazionala": {
    color: "#FF0000",
    logo: "/assets/icons/BILDU.png",
    displayName: "Ezker Nazionala"
  },

  // Partidos nacionalistas gallegos
  "BNG": {
    color: "#0099FF",
    logo: "/assets/icons/BNGNEW.jpg",
    displayName: "BNG"
  },
  "Bloque Nacionalista Galego": {
    color: "#0099FF",
    logo: "/assets/icons/BNGNEW.jpg",
    displayName: "BNG"
  },

  // Partidos canarios
  "Coalición Canaria": {
    color: "#FFCC00",
    logo: "/assets/icons/CoalicionCanaria.png",
    displayName: "Coalición Canaria"
  },
  "CC": {
    color: "#FFCC00",
    logo: "/assets/icons/CoalicionCanaria.png",
    displayName: "CC"
  },
  "UPL": {
    color: "#FFCC00",
    logo: "/assets/icons/UPN.png",
    displayName: "UPL"
  },

  // Otros partidos
  "Frente Obrero": {
    color: "#8B0000",
    logo: "/assets/icons/FrenteObrero.png",
    displayName: "Frente Obrero"
  },
  "SALF": {
    color: "#FF1493",
    logo: "/assets/icons/SeAcabóLaFiesta.png",
    displayName: "Se Acabó La Fiesta"
  },
  "Escaños en Blanco": {
    color: "#808080",
    logo: "/assets/icons/EscañosEnBlanco.png",
    displayName: "Escaños en Blanco"
  },
  "Izquierda Española": {
    color: "#FF0000",
    logo: "/assets/icons/IzquierdaEspañolaNEW.png",
    displayName: "Izquierda Española"
  },
  "Izquierda Unida": {
    color: "#FF0000",
    logo: "/assets/icons/IzquierdaEspañolaNEW.png",
    displayName: "Izquierda Unida"
  },
  "Caminando Juntos": {
    color: "#9370DB",
    logo: "/assets/icons/CaminandoJuntos.png",
    displayName: "Caminando Juntos"
  },
  "Falange": {
    color: "#8B0000",
    logo: "/assets/icons/FALANGENEW.webp",
    displayName: "Falange"
  },
  "Falange Española de las JONS": {
    color: "#8B0000",
    logo: "/assets/icons/FALANGENEW.webp",
    displayName: "Falange Española"
  },
  "Soberanía y Trabajo": {
    color: "#8B0000",
    logo: "/assets/icons/SoberaniaYTrabajo.png",
    displayName: "Soberanía y Trabajo"
  },
  "Soberanía y Trabajo.": {
    color: "#8B0000",
    logo: "/assets/icons/SoberaniaYTrabajo.png",
    displayName: "Soberanía y Trabajo"
  },
  "P-Lib": {
    color: "#FFD700",
    logo: "/assets/icons/P-Lib.jpg",
    displayName: "P-Lib"
  },
  "P-lib": {
    color: "#FFD700",
    logo: "/assets/icons/P-Lib.jpg",
    displayName: "P-lib"
  },
  "PACMA": {
    color: "#00AA44",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/hDwYeFmKiKHHhgZI.png",
    displayName: "PACMA"
  },
  "Comunión Tradicionalista": {
    color: "#8B0000",
    logo: "/assets/icons/ComunionTradicionalist.png",
    displayName: "Comunión Tradicionalista"
  },
  "CUP": {
    color: "#FF6600",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/qlFqJHJrlRttAYmH.png",
    displayName: "CUP"
  },
  "Adelante Andalucía": {
    color: "#FF0000",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/tTkePaUFEpyBEbYg.png",
    displayName: "Adelante Andalucía"
  },
  "AA": {
    color: "#FF0000",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/tTkePaUFEpyBEbYg.png",
    displayName: "Adelante Andalucía"
  },
  "PCTE": {
    color: "#CC0000",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/OxYlERpqIvuYLNIC.png",
    displayName: "PCTE"
  },
  "UPL": {
    color: "#0066FF",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/mwmmLxCMDbZacPQT.png",
    displayName: "UPL"
  },
  "Por España": {
    color: "#0066FF",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/LfhcjcOgngqwFaRh.png",
    displayName: "Por España"
  },
  "PE": {
    color: "#0066FF",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/LfhcjcOgngqwFaRh.png",
    displayName: "Por España"
  },
  "Núcleo Nacional": {
    color: "#FF0000",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/cxzxAKrYdmopDhFQ.png",
    displayName: "Núcleo Nacional"
  },
  "NN": {
    color: "#FF0000",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/cxzxAKrYdmopDhFQ.png",
    displayName: "Núcleo Nacional"
  },
  "Aragón Existe": {
    color: "#FFD700",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/WYyKtKyxSmCkVtuk.png",
    displayName: "Aragón Existe"
  },
  "AE": {
    color: "#FFD700",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/WYyKtKyxSmCkVtuk.png",
    displayName: "Aragón Existe"
  },
  "Chunta Aragonesista": {
    color: "#003D99",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/YgTqCeiHToEqDmlL.png",
    displayName: "Chunta Aragonesista"
  },
  "CHA": {
    color: "#003D99",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/YgTqCeiHToEqDmlL.png",
    displayName: "Chunta Aragonesista"
  },
  "Por Andalucía": {
    color: "#FF0000",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/CeQBGvSmlrncUwYs.png",
    displayName: "Por Andalucía"
  },
  "PA": {
    color: "#FF0000",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/CeQBGvSmlrncUwYs.png",
    displayName: "Por Andalucía"
  },
  "Frente de Izquierdas": {
    color: "#CC0000",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/flLSuaHeOIjYDIve.jpg",
    displayName: "Frente de Izquierdas"
  },
  "FI": {
    color: "#CC0000",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/flLSuaHeOIjYDIve.jpg",
    displayName: "Frente de Izquierdas"
  },
  "RecortesCero": {
    color: "#FF0000",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/flLSuaHeOIjYDIve.jpg",
    displayName: "RecortesCero"
  },
  "SALF": {
    color: "#FF1493",
    logo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/pVOVNQaSxYeSVYyR.png",
    displayName: "Se Acabó La Fiesta"
  },
  "UPN": {
    color: "#0066CC",
    logo: "/assets/icons/UPNNew.png",
    displayName: "UPN"
  },
  "Otros": {
    color: "#CCCCCC",
    logo: "/assets/icons/Otros.png",
    displayName: "Otros"
  },

  // Asociaciones Juveniles
  "S'ha Acabat!": {
    color: "#FF6600",
    logo: "/assets/icons/SHaAcabat.jpg",
    displayName: "S'ha Acabat!"
  },
  "Revuelta": {
    color: "#6B1B47",
    logo: "/assets/icons/RevueltaNEW.jpg",
    displayName: "Revuelta"
  },
  "Nuevas Generaciones del PP": {
    color: "#0066CC",
    logo: "/assets/icons/NuevasGeneracionesdelPP.png",
    displayName: "NNGG"
  },
  "Jóvenes de VOX": {
    color: "#24AA3D",
    logo: "/assets/icons/JóvenesDeVOXNEW.png",
    displayName: "JVOX"
  },
  "Voces Libres España (VLE)": {
    color: "#FFD700",
    logo: "/assets/icons/VocesLibresEspanaNEW.jpg",
    displayName: "VLE"
  },
  "Juventudes Socialistas de España": {
    color: "#E81828",
    logo: "/assets/icons/JuventudesSocialistasdeEspañaNEW.png",
    displayName: "JSE"
  },
  "Acción Patriota": {
    color: "#FF0000",
    logo: "/assets/icons/Patriota.png",
    displayName: "Patriota"
  },
  "Juventudes de Izquierda Unida": {
    color: "#CC0000",
    logo: "/assets/icons/JuventudesDeIzquierdaUnida.jpg",
    displayName: "JIU"
  },
  "Juventudes Comunistas": {
    color: "#CC0000",
    logo: "/assets/icons/JuventudesDeIzquierdaUnida.jpg",
    displayName: "JCOMUNISTA"
  },
  "Jóvenes de Ciudadanos": {
    color: "#FF9900",
    logo: "/assets/icons/JovenesDeVoxNEW.png",
    displayName: "JCS"
  },
  "EGI": {
    color: "#00AA44",
    logo: "/assets/icons/PNV.png",
    displayName: "EGI"
  },
  "Ernai": {
    color: "#00AA44",
    logo: "/assets/icons/PNV.png",
    displayName: "Ernai"
  },
  "Joventuts d'Esquerra Republicana de Catalunya": {
    color: "#FFC400",
    logo: "/assets/icons/ERC.png",
    displayName: "JERC"
  },
  "Joventut Nacionalista de Catalunya": {
    color: "#003D99",
    logo: "/assets/icons/JoventutNacionalistadeCatalunyaNEW.png",
    displayName: "JNC"
  },
  "Galiza Nova": {
    color: "#003D99",
    logo: "/assets/icons/GalizanovaNEW.png",
    displayName: "Galiza Nova"
  },
  "Arran": {
    color: "#00AA44",
    logo: "/assets/icons/GeneracionOperativa.webp",
    displayName: "Arran"
  },
  "Jóvenes Nacionalistas de Canarias": {
    color: "#FFCC00",
    logo: "/assets/icons/Patriota.png",
    displayName: "JNCANA"
  },
  "Joves del País Valencià – Compromís": {
    color: "#FF9900",
    logo: "/assets/icons/Patriota.png",
    displayName: "JPV"
  },
  "Acción Castilla y León": {
    color: "#FFD700",
    logo: "/assets/icons/AcciónCastillayLeónNEW.png",
    displayName: "ACL"
  },
  "Juventud Estudiante Católica": {
    color: "#0066CC",
    logo: "/assets/icons/JuventudEstudianteCatólicaNEW.jpg",
    displayName: "JEC"
  },
  "ÁGORA Canarias": {
    color: "#FFCC00",
    logo: "/assets/icons/Patriota.png",
    displayName: "ÁGORA"
  },

};

/**
 * Obtener configuración de un partido
 * @param partyName Nombre del partido
 * @returns Configuración del partido o configuración por defecto
 */
export function getPartyConfig(partyName: string): PartyConfig {
  const runtimeConfig = findRuntimePartyConfigByNameOrKey(partyName);
  if (runtimeConfig) {
    return {
      color: runtimeConfig.color,
      logo: runtimeConfig.logoUrl,
      displayName: runtimeConfig.displayName,
    };
  }

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

  // Configuración por defecto - usar imagen de fallback
  return {
    color: "#999999",
    logo: "/assets/icons/Otros.png",
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
 * @returns Logo del partido (ruta de imagen)
 */
export function getPartyLogo(partyName: string): string {
  return getPartyConfig(partyName).logo;
}
