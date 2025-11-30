/**
 * Implementación de la Ley d'Hondt por provincia para elecciones generales
 * Calcula escaños aplicando el umbral del 3% dentro de cada provincia
 */

import { calcularEscanosDHondt } from './dhondt';

// Distribución de escaños por provincia (350 escaños totales)
// Basado en la distribución real del sistema electoral español
const ESCANOS_POR_PROVINCIA: Record<string, number> = {
  'Madrid': 37,
  'Barcelona': 32,
  'Valencia': 16,
  'Sevilla': 12,
  'Alicante': 12,
  'Málaga': 11,
  'Murcia': 10,
  'Cádiz': 9,
  'A Coruña': 8,
  'Las Palmas': 8,
  'Bizkaia': 8,
  'Illes Balears': 8,
  'Zaragoza': 7,
  'Santa Cruz de Tenerife': 7,
  'Asturias': 7,
  'Granada': 7,
  'Pontevedra': 7,
  'Almería': 6,
  'Córdoba': 6,
  'Gipuzkoa': 6,
  'Girona': 6,
  'Tarragona': 6,
  'Toledo': 6,
  'Badajoz': 5,
  'Cantabria': 5,
  'Castellón': 5,
  'Ciudad Real': 5,
  'Huelva': 5,
  'Jaén': 5,
  'Navarra': 5,
  'Valladolid': 5,
  'Álava': 4,
  'Albacete': 4,
  'Burgos': 4,
  'Cáceres': 4,
  'La Rioja': 4,
  'León': 4,
  'Lleida': 4,
  'Lugo': 4,
  'Ourense': 4,
  'Salamanca': 4,
  'Ávila': 3,
  'Cuenca': 3,
  'Guadalajara': 3,
  'Huesca': 3,
  'Palencia': 3,
  'Segovia': 3,
  'Teruel': 3,
  'Zamora': 3,
  'Soria': 2,
  'Ceuta': 1,
  'Melilla': 1,
};

/**
 * Calcula escaños por provincia aplicando Ley d'Hondt con umbral del 3% en cada provincia
 * @param votosPorProvincia - Objeto con votos por provincia: { provincia: { partido: votos } }
 * @returns Objeto con escaños totales por partido: { partido: escaños }
 */
export function calcularEscanosGeneralesPorProvincia(
  votosPorProvincia: Record<string, Record<string, number>>
): Record<string, number> {
  const escanosTotal: Record<string, number> = {};

  // Procesar cada provincia
  for (const [provincia, votosPartidos] of Object.entries(votosPorProvincia)) {
    const escanosEnProvincia = ESCANOS_POR_PROVINCIA[provincia] || 0;
    
    if (escanosEnProvincia === 0) continue;

    // Aplicar Ley d'Hondt con umbral del 3% en esta provincia
    const escanosEnEstaProvincia = calcularEscanosDHondt(votosPartidos, escanosEnProvincia, 3);

    // Agregar escaños al total nacional
    for (const [partido, escanos] of Object.entries(escanosEnEstaProvincia)) {
      escanosTotal[partido] = (escanosTotal[partido] || 0) + escanos;
    }
  }

  return escanosTotal;
}

/**
 * Obtiene la distribución de escaños por provincia
 */
export function getEscanosPorProvincia(): Record<string, number> {
  return ESCANOS_POR_PROVINCIA;
}

/**
 * Calcula escaños para una provincia específica
 */
export function calcularEscanosProvincia(
  provincia: string,
  votos: Record<string, number>
): Record<string, number> {
  const escanosEnProvincia = ESCANOS_POR_PROVINCIA[provincia] || 0;
  return calcularEscanosDHondt(votos, escanosEnProvincia, 3);
}

/**
 * Obtiene el total de escaños (debe ser 350)
 */
export function getTotalEscanos(): number {
  return Object.values(ESCANOS_POR_PROVINCIA).reduce((a, b) => a + b, 0);
}

/**
 * Calcula escaños juveniles por provincia
 * Para asociaciones juveniles con 100 escaños totales y umbral del 4%
 * Salamanca: 5 escaños (especial)
 */
export function calcularEscanosJuvenilesPorProvincia(
  votosPorProvincia: Record<string, Record<string, number>>
): Record<string, number> {
  const escanosTotal: Record<string, number> = {};

  // Distribución de 100 escaños entre provincias
  // Total: 100 escaños
  // Salamanca: 5 escaños (especial)
  // Resto distribuido proporcionalmente
  const ESCANOS_JUVENILES_POR_PROVINCIA: Record<string, number> = {
    'Madrid': 12,
    'Barcelona': 10,
    'Valencia': 6,
    'Sevilla': 4,
    'Alicante': 4,
    'Málaga': 4,
    'Murcia': 4,
    'Cádiz': 3,
    'A Coruña': 3,
    'Las Palmas': 3,
    'Bizkaia': 3,
    'Illes Balears': 3,
    'Zaragoza': 3,
    'Santa Cruz de Tenerife': 3,
    'Asturias': 3,
    'Granada': 3,
    'Pontevedra': 3,
    'Almería': 2,
    'Córdoba': 2,
    'Gipuzkoa': 2,
    'Girona': 2,
    'Tarragona': 2,
    'Toledo': 2,
    'Badajoz': 1,
    'Cantabria': 1,
    'Castellón': 1,
    'Ciudad Real': 1,
    'Huelva': 1,
    'Jaén': 1,
    'Navarra': 1,
    'Valladolid': 1,
    'Álava': 1,
    'Albacete': 1,
    'Burgos': 1,
    'Cáceres': 1,
    'La Rioja': 1,
    'León': 1,
    'Lleida': 1,
    'Lugo': 1,
    'Ourense': 1,
    'Palencia': 1,
    'Salamanca': 5,  // ESPECIAL: 5 escaños para Salamanca
    'Segovia': 1,
    'Soria': 1,
    'Teruel': 1,
    'Ávila': 1,
    'Cuenca': 1,
    'Guadalajara': 1,
    'Huesca': 1,
    'Zamora': 1,
  };

  // Procesar cada provincia
  for (const [provincia, votosPartidos] of Object.entries(votosPorProvincia)) {
    const escanosEnProvincia = ESCANOS_JUVENILES_POR_PROVINCIA[provincia] || 0;
    
    if (escanosEnProvincia === 0) continue;

    // Aplicar Ley d'Hondt con umbral del 4% para asociaciones juveniles
    const escanosEnEstaProvincia = calcularEscanosDHondt(votosPartidos, escanosEnProvincia, 4);

    // Agregar escaños al total nacional
    for (const [asociacion, escanos] of Object.entries(escanosEnEstaProvincia)) {
      escanosTotal[asociacion] = (escanosTotal[asociacion] || 0) + escanos;
    }
  }

  return escanosTotal;
}

/**
 * Calcula escaños juveniles para una provincia específica
 */
export function calcularEscanosJuvenilesProvincia(
  provincia: string,
  votos: Record<string, number>
): Record<string, number> {
  const ESCANOS_JUVENILES_POR_PROVINCIA: Record<string, number> = {
    'Madrid': 12,
    'Barcelona': 10,
    'Valencia': 6,
    'Sevilla': 4,
    'Alicante': 4,
    'Málaga': 4,
    'Murcia': 4,
    'Cádiz': 3,
    'A Coruña': 3,
    'Las Palmas': 3,
    'Bizkaia': 3,
    'Illes Balears': 3,
    'Zaragoza': 3,
    'Santa Cruz de Tenerife': 3,
    'Asturias': 3,
    'Granada': 3,
    'Pontevedra': 3,
    'Almería': 2,
    'Córdoba': 2,
    'Gipuzkoa': 2,
    'Girona': 2,
    'Tarragona': 2,
    'Toledo': 2,
    'Badajoz': 1,
    'Cantabria': 1,
    'Castellón': 1,
    'Ciudad Real': 1,
    'Huelva': 1,
    'Jaén': 1,
    'Navarra': 1,
    'Valladolid': 1,
    'Álava': 1,
    'Albacete': 1,
    'Burgos': 1,
    'Cáceres': 1,
    'La Rioja': 1,
    'León': 1,
    'Lleida': 1,
    'Lugo': 1,
    'Ourense': 1,
    'Palencia': 1,
    'Salamanca': 5,
    'Segovia': 1,
    'Soria': 1,
    'Teruel': 1,
    'Ávila': 1,
    'Cuenca': 1,
    'Guadalajara': 1,
    'Huesca': 1,
    'Zamora': 1,
  };
  
  const escanosEnProvincia = ESCANOS_JUVENILES_POR_PROVINCIA[provincia] || 0;
  return calcularEscanosDHondt(votos, escanosEnProvincia, 4);
}
