/**
 * Colores característicos de partidos políticos españoles
 * Basados en identidad visual oficial de cada partido
 */

export const PARTY_COLORS: Record<string, string> = {
  // Partidos principales
  'PP': '#0066CC',                    // Azul marino (Partido Popular)
  'PSOE': '#E31C23',                  // Rojo (Partido Socialista Obrero Español)
  'VOX': '#63B432',                   // Verde (VOX)
  'Ciudadanos': '#FF9900',            // Naranja (Ciudadanos)
  'CIUDADANOS': '#FF9900',            // Naranja (Ciudadanos - mayúsculas)
  'PODEMOS': '#7B2D6B',               // Púrpura (Podemos)
  'SUMAR': '#EE5A24',                 // Naranja-rojo (Sumar)
  
  // Partidos nacionalistas catalanes
  'ERC': '#FFD700',                   // Amarillo (Esquerra Republicana de Catalunya)
  'JUNTS': '#0066CC',                 // Azul (Junts per Catalunya)
  'Aliança Catalana': '#0066CC',      // Azul (Aliança Catalana)
  
  // Partidos nacionalistas vascos
  'PNV': '#00AA44',                   // Verde (Partido Nacionalista Vasco)
  'BILDU': '#00AA44',                 // Verde (BILDU)
  'Ezker Nazionala': '#FF0000',       // Rojo (Ezker Nazionala)
  
  // Partidos nacionalistas gallegos
  'BNG': '#0066CC',                   // Azul (Bloque Nacionalista Galego)
  
  // Partidos canarios
  'Coalición Canaria': '#FFC400',     // Amarillo (Coalición Canaria)
  'UPL': '#FFCC00',                   // Amarillo (Unión del Pueblo Leonés)
  
  // Otros partidos
  'Se Acabó La Fiesta': '#FF1493',    // Rosa/Magenta (Se Acabó La Fiesta)
  'Escaños en Blanco': '#808080',     // Gris (Escaños en Blanco)
  'Frente Obrero': '#8B0000',         // Rojo oscuro (Frente Obrero)
  'P-Lib': '#FFD700',                 // Amarillo (P-Lib)
  'P-lib': '#FFD700',                 // Amarillo (P-lib - minúsculas)
  'Caminando Juntos': '#9370DB',      // Púrpura medio (Caminando Juntos)
  'Izquierda Española': '#FF0000',    // Rojo (Izquierda Española)
  'Izquierda Unida': '#FF0000',       // Rojo (Izquierda Unida)
  'PACMA': '#00AA44',                 // Verde (PACMA - Partido Animalista)
  'Soberanía y Trabajo.': '#8B0000',  // Rojo oscuro (Soberanía y Trabajo)
  'Comunión Tradicionalista': '#8B0000', // Rojo oscuro (Comunión Tradicionalista)
  'Falange': '#8B0000',               // Rojo oscuro (Falange)
  'CUP': '#FF6600',                   // Naranja (CUP - Candidatura d'Unitat Popular)
  'Adelante Andalucía': '#FF0000',    // Rojo (Adelante Andalucía)
  'UPN': '#0066CC',                   // Azul (Unión del Pueblo Navarro)
  
  // Default
  'default': '#999999'
};

/**
 * Obtener color de un partido por nombre
 */
export function getPartyColor(partyName: string): string {
  // Buscar coincidencia exacta
  if (PARTY_COLORS[partyName]) {
    return PARTY_COLORS[partyName];
  }
  
  // Buscar por nombre parcial (para variantes)
  for (const [key, color] of Object.entries(PARTY_COLORS)) {
    if (partyName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(partyName.toLowerCase())) {
      return color;
    }
  }
  
  return PARTY_COLORS['default'];
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
  'ERC': '#FFD700',
  'JUNTS': '#0066CC',
  'PNV': '#00AA44',
  'BNG': '#0066CC',
  'BILDU': '#00AA44',
  'Aliança Catalana': '#0066CC',
  'Se Acabó La Fiesta': '#FF1493',
  'Escaños en Blanco': '#808080',
  'Frente Obrero': '#8B0000',
  'P-Lib': '#FFD700',
  'Caminando Juntos': '#9370DB',
  'Izquierda Española': '#FF0000',
  'PACMA': '#00AA44',
  'Soberanía y Trabajo.': '#8B0000',
  'Comunión Tradicionalista': '#8B0000',
  'Falange': '#8B0000',
  'CUP': '#FF6600',
  'Adelante Andalucía': '#FF0000',
  'UPN': '#0066CC',
  'Coalición Canaria': '#FFC400',
  'UPL': '#FFCC00',
  'Ezker Nazionala': '#FF0000',
};
