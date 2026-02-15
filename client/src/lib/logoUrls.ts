/**
 * Mapeo de URLs de logos en S3
 * Todos los logos están alojados en CDN para garantizar disponibilidad
 */

export const PARTY_LOGOS: Record<string, string> = {
  // Partidos principales
  PP: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/PP.png',
  PSOE: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/PSOE.png',
  VOX: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/VOX.png',
  PODEMOS: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/PODEMOS.png',
  SUMAR: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/SUMAR.png',
  CIUDADANOS: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/CIUDADANOS.png',
  ERC: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/ERC.png',
  JUNTS: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/JUNTS.png',
  EH_BILDU: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/EH_BILDU.png',
  BNG: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/BNG.png',
  COMPROMIS: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/COMPROMIS.png',
  MAS_PAIS: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/MAS_PAIS.png',
  ESCANOS_EN_BLANCO: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/ESCANOS_EN_BLANCO.png',
  
  // Nuevos partidos - URLs de S3
  ADELANTE_ANDALUCIA: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/tTkePaUFEpyBEbYg.png',
  ALIANCA_CATALANA: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/LSGJuMLqKLfIuSBC.png',
  ARAGON_EXISTE: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/WYyKtKyxSmCkVtuk.png',
  CUP: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/qlFqJHJrlRttAYmH.png',
  CHUNTA_ARAGONESISTA: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/YgTqCeiHToEqDmlL.png',
  FRENTE_DE_IZQUIERDAS: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/flLSuaHeOIjYDIve.jpg',
  NUCLEO_NACIONAL: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/cxzxAKrYdmopDhFQ.png',
  PACMA: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/hDwYeFmKiKHHhgZI.png',
  PCTE: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/OxYlERpqIvuYLNIC.png',
  POR_ANDALUCIA: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/CeQBGvSmlrncUwYs.png',
  POR_ESPANA: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/LfhcjcOgngqwFaRh.png',
  SE_ACABO_LA_FIESTA: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/pVOVNQaSxYeSVYyR.png',
  UPL: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/mwmmLxCMDbZacPQT.png',
};

/**
 * Obtener URL del logo de un partido
 * Si no existe, retorna un placeholder
 */
export function getPartyLogoUrl(partyCode: string): string {
  return PARTY_LOGOS[partyCode] || 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/placeholder.png';
}

/**
 * Validar que una URL de logo está disponible
 */
export async function validateLogoUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
