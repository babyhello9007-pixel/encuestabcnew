/**
 * Colores característicos de partidos políticos españoles
 * Basados en identidad visual oficial de cada partido
 */

export const PARTY_COLORS: Record<string, string> = {
  // Partidos principales
  'PP': '#0066CC',           // Azul marino (Partido Popular)
  'PSOE': '#E31C23',         // Rojo (Partido Socialista Obrero Español)
  'VOX': '#63B432',          // Verde (VOX)
  'Ciudadanos': '#FF9900',   // Naranja (Ciudadanos)
  'PODEMOS': '#7B2D6B',      // Púrpura (Podemos)
  'SUMAR': '#EE5A24',        // Naranja-rojo (Sumar)
  
  // Partidos nacionalistas
  'ERC': '#FFD700',          // Amarillo (Esquerra Republicana de Catalunya)
  'JUNTS': '#0066CC',        // Azul (Junts per Catalunya)
  'PNV': '#00AA44',          // Verde (Partido Nacionalista Vasco)
  'BNG': '#0066CC',          // Azul (Bloque Nacionalista Galego)
  'Coalición Canaria': '#FFC400', // Amarillo (Coalición Canaria)
  
  // Otros partidos
  'Se Acabó La Fiesta': '#FF1493', // Rosa/Magenta
  'Izquierda Unida': '#FF0000',    // Rojo
  'Aliança Catalana': '#0066CC',   // Azul
  'Escaños en Blanco': '#808080',  // Gris
  'Frente Obrero': '#8B0000',      // Rojo oscuro
  'P-Lib': '#FFD700',              // Amarillo
  'Caminando Juntos': '#9370DB',   // Púrpura medio
  
  // Default
  'default': '#999999'
};

/**
 * Obtener color de un partido por nombre
 */
export function getPartyColor(partyName: string): string {
  return PARTY_COLORS[partyName] || PARTY_COLORS['default'];
}

/**
 * Colores para gráficos (con formato específico para Recharts)
 */
export const CHART_COLORS = {
  'PP': '#0066CC',
  'PSOE': '#E31C23',
  'VOX': '#63B432',
  'Ciudadanos': '#FF9900',
  'PODEMOS': '#7B2D6B',
  'SUMAR': '#EE5A24',
};

