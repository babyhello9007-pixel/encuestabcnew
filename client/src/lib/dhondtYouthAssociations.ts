/**
 * Implementación de la Ley d'Hondt por provincia para asociaciones juveniles
 * Calcula escaños aplicando el umbral del 4% dentro de cada provincia
 * Total: 100 escaños (distribuidos proporcionalmente a las provincias)
 */

import { calcularEscanosDHondt } from './dhondt';

// Distribución de escaños por provincia para asociaciones juveniles (100 escaños totales)
// Basado en proporción de población joven por provincia
const ESCANOS_ASOCIACIONES_POR_PROVINCIA: Record<string, number> = {
  'Madrid': 10,
  'Barcelona': 9,
  'Valencia': 5,
  'Sevilla': 4,
  'Alicante': 4,
  'Málaga': 3,
  'Murcia': 3,
  'Cádiz': 3,
  'A Coruña': 1,
  'Las Palmas': 1,
  'Bizkaia': 1,
  'Illes Balears': 1,
  'Zaragoza': 1,
  'Santa Cruz de Tenerife': 1,
  'Asturias': 1,
  'Granada': 1,
  'Pontevedra': 1,
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
  'Salamanca': 5,
  'Ávila': 1,
  'Cuenca': 1,
  'Guadalajara': 1,
  'Huesca': 1,
  'Palencia': 1,
  'Segovia': 1,
  'Teruel': 1,
  'Zamora': 1,
  'Soria': 1,
  'Ceuta': 1,
  'Melilla': 1,
};

/**
 * Calcula escaños por provincia aplicando Ley d'Hondt con umbral del 4% en cada provincia
 * @param votosPorProvincia - Objeto con votos por provincia: { provincia: { asociacion: votos } }
 * @returns Objeto con escaños totales por asociación: { asociacion: escaños }
 */
export function calcularEscanosAsociacionesPorProvincia(
  votosPorProvincia: Record<string, Record<string, number>>
): Record<string, number> {
  const escanosTotal: Record<string, number> = {};

  // Procesar cada provincia
  for (const [provincia, votosAsociaciones] of Object.entries(votosPorProvincia)) {
    const escanosEnProvincia = ESCANOS_ASOCIACIONES_POR_PROVINCIA[provincia] || 0;
    
    if (escanosEnProvincia === 0) continue;

    // Aplicar Ley d'Hondt con umbral del 4% en esta provincia
    const escanosEnEstaProvincia = calcularEscanosDHondt(votosAsociaciones, escanosEnProvincia, 4);

    // Agregar escaños al total nacional
    for (const [asociacion, escanos] of Object.entries(escanosEnEstaProvincia)) {
      escanosTotal[asociacion] = (escanosTotal[asociacion] || 0) + escanos;
    }
  }

  return escanosTotal;
}

/**
 * Obtiene la distribución de escaños por provincia para asociaciones
 */
export function getEscanosAsociacionesPorProvincia(): Record<string, number> {
  return ESCANOS_ASOCIACIONES_POR_PROVINCIA;
}

/**
 * Calcula escaños para una provincia específica (asociaciones)
 */
export function calcularEscanosProvinciasAsociaciones(
  provincia: string,
  votos: Record<string, number>
): Record<string, number> {
  const escanosEnProvincia = ESCANOS_ASOCIACIONES_POR_PROVINCIA[provincia] || 0;
  return calcularEscanosDHondt(votos, escanosEnProvincia, 4);
}

/**
 * Obtiene el total de escaños para asociaciones (debe ser 100)
 */
export function getTotalEscanosAsociaciones(): number {
  return Object.values(ESCANOS_ASOCIACIONES_POR_PROVINCIA).reduce((a, b) => a + b, 0);
}
