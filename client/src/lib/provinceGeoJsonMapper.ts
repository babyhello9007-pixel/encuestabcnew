/**
 * Mapea nombres de provincias a sus geometrías en el GeoJSON de es-atlas
 */

import { normalizeProvinceName } from './provinceNameNormalizer';

// Mapeo de nombres normalizados a IDs en el GeoJSON de es-atlas
const PROVINCE_ID_MAP: Record<string, string> = {
  "Araba/Álava": "01",
  "Albacete": "02",
  "Alacant/Alicante": "03",
  "Almería": "04",
  "Ávila": "05",
  "Badajoz": "06",
  "Illes Balears": "07",
  "Barcelona": "08",
  "Burgos": "09",
  "Cáceres": "10",
  "Cádiz": "11",
  "Castelló/Castellón": "12",
  "Ciudad Real": "13",
  "Córdoba": "14",
  "A Coruña": "15",
  "Cuenca": "16",
  "Girona": "17",
  "Granada": "18",
  "Guadalajara": "19",
  "Gipuzkoa": "20",
  "Huelva": "21",
  "Huesca": "22",
  "Jaén": "23",
  "León": "24",
  "Lleida": "25",
  "La Rioja": "26",
  "Lugo": "27",
  "Madrid": "28",
  "Málaga": "29",
  "Murcia": "30",
  "Navarra": "31",
  "Ourense": "32",
  "Asturias": "33",
  "Palencia": "34",
  "Pontevedra": "36",
  "Salamanca": "37",
  "Cantabria": "39",
  "Segovia": "40",
  "Sevilla": "41",
  "Soria": "42",
  "Tarragona": "43",
  "Teruel": "44",
  "Toledo": "45",
  "València/Valencia": "46",
  "Valladolid": "47",
  "Bizkaia": "48",
  "Zamora": "49",
  "Zaragoza": "50",
  "Ceuta": "51",
  "Melilla": "52",
  "Las Palmas": "35",
  "Santa Cruz de Tenerife": "38",
};

/**
 * Obtiene el ID de la provincia en el GeoJSON
 * @param provinceName Nombre de la provincia
 * @returns ID de la provincia en es-atlas
 */
export function getProvinceGeoJsonId(provinceName: string | null | undefined): string | null {
  if (!provinceName) return null;
  
  const normalized = normalizeProvinceName(provinceName);
  if (!normalized) return null;
  
  return PROVINCE_ID_MAP[normalized] || null;
}

/**
 * Obtiene el nombre normalizado de una provincia dado su ID
 * @param provinceId ID de la provincia en es-atlas
 * @returns Nombre normalizado
 */
export function getProvinceNameFromId(provinceId: string): string | null {
  for (const [name, id] of Object.entries(PROVINCE_ID_MAP)) {
    if (id === provinceId) {
      return name;
    }
  }
  return null;
}

/**
 * Obtiene todos los IDs de provincias disponibles
 * @returns Array de IDs de provincias
 */
export function getAllProvinceIds(): string[] {
  return Object.values(PROVINCE_ID_MAP);
}

/**
 * Obtiene todos los nombres de provincias disponibles
 * @returns Array de nombres de provincias
 */
export function getAllProvinceNames(): string[] {
  return Object.keys(PROVINCE_ID_MAP);
}

/**
 * Verifica si una provincia existe en el GeoJSON
 * @param provinceName Nombre de la provincia
 * @returns true si existe
 */
export function provinceExists(provinceName: string | null | undefined): boolean {
  return getProvinceGeoJsonId(provinceName) !== null;
}

/**
 * Obtiene información de todas las provincias
 * @returns Array de objetos con nombre e ID
 */
export function getAllProvinces(): Array<{ name: string; id: string }> {
  return Object.entries(PROVINCE_ID_MAP).map(([name, id]) => ({
    name,
    id,
  }));
}
