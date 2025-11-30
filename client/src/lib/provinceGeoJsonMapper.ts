/**
 * Mapeo bidireccional entre nombres de provincias en español (BD Supabase)
 * y nombres en el GeoJSON georef-spain-provincia.geojson
 * 
 * Supabase usa nombres en español: Álava, Alicante, Castellón, Valencia
 * GeoJSON usa nombres locales: Araba, Alacant, Castelló, València
 */

// Mapeo de español (Supabase) → GeoJSON
export const SPANISH_TO_GEOJSON: Record<string, string> = {
  'Álava': 'Araba',
  'Alicante': 'Alacant',
  'Castellón': 'Castelló',
  'Valencia': 'València',
  'A Coruña': 'A Coruña',
  'Albacete': 'Albacete',
  'Almería': 'Almería',
  'Asturias': 'Asturias',
  'Badajoz': 'Badajoz',
  'Barcelona': 'Barcelona',
  'Bizkaia': 'Bizkaia',
  'Burgos': 'Burgos',
  'Cantabria': 'Cantabria',
  'Ceuta': 'Ceuta',
  'Ciudad Real': 'Ciudad Real',
  'Cuenca': 'Cuenca',
  'Cáceres': 'Cáceres',
  'Cádiz': 'Cádiz',
  'Córdoba': 'Córdoba',
  'Gipuzkoa': 'Gipuzkoa',
  'Girona': 'Girona',
  'Granada': 'Granada',
  'Guadalajara': 'Guadalajara',
  'Huelva': 'Huelva',
  'Huesca': 'Huesca',
  'Illes Balears': 'Illes Balears',
  'Jaén': 'Jaén',
  'La Rioja': 'La Rioja',
  'Las Palmas': 'Las Palmas',
  'León': 'León',
  'Lleida': 'Lleida',
  'Lugo': 'Lugo',
  'Madrid': 'Madrid',
  'Melilla': 'Melilla',
  'Murcia': 'Murcia',
  'Málaga': 'Málaga',
  'Navarra': 'Navarra',
  'Ourense': 'Ourense',
  'Palencia': 'Palencia',
  'Pontevedra': 'Pontevedra',
  'Salamanca': 'Salamanca',
  'Santa Cruz de Tenerife': 'Santa Cruz de Tenerife',
  'Segovia': 'Segovia',
  'Sevilla': 'Sevilla',
  'Soria': 'Soria',
  'Tarragona': 'Tarragona',
  'Teruel': 'Teruel',
  'Toledo': 'Toledo',
  'Valladolid': 'Valladolid',
  'Zamora': 'Zamora',
  'Zaragoza': 'Zaragoza',
  'Ávila': 'Ávila',
};

// Mapeo inverso: GeoJSON → español (Supabase)
export const GEOJSON_TO_SPANISH: Record<string, string> = {
  'Araba': 'Álava',
  'Alacant': 'Alicante',
  'Castelló': 'Castellón',
  'València': 'Valencia',
  'A Coruña': 'A Coruña',
  'Albacete': 'Albacete',
  'Almería': 'Almería',
  'Asturias': 'Asturias',
  'Badajoz': 'Badajoz',
  'Barcelona': 'Barcelona',
  'Bizkaia': 'Bizkaia',
  'Burgos': 'Burgos',
  'Cantabria': 'Cantabria',
  'Ceuta': 'Ceuta',
  'Ciudad Real': 'Ciudad Real',
  'Cuenca': 'Cuenca',
  'Cáceres': 'Cáceres',
  'Cádiz': 'Cádiz',
  'Córdoba': 'Córdoba',
  'Gipuzkoa': 'Gipuzkoa',
  'Girona': 'Girona',
  'Granada': 'Granada',
  'Guadalajara': 'Guadalajara',
  'Huelva': 'Huelva',
  'Huesca': 'Huesca',
  'Illes Balears': 'Illes Balears',
  'Jaén': 'Jaén',
  'La Rioja': 'La Rioja',
  'Las Palmas': 'Las Palmas',
  'León': 'León',
  'Lleida': 'Lleida',
  'Lugo': 'Lugo',
  'Madrid': 'Madrid',
  'Melilla': 'Melilla',
  'Murcia': 'Murcia',
  'Málaga': 'Málaga',
  'Navarra': 'Navarra',
  'Ourense': 'Ourense',
  'Palencia': 'Palencia',
  'Pontevedra': 'Pontevedra',
  'Salamanca': 'Salamanca',
  'Santa Cruz de Tenerife': 'Santa Cruz de Tenerife',
  'Segovia': 'Segovia',
  'Sevilla': 'Sevilla',
  'Soria': 'Soria',
  'Tarragona': 'Tarragona',
  'Teruel': 'Teruel',
  'Toledo': 'Toledo',
  'Valladolid': 'Valladolid',
  'Zamora': 'Zamora',
  'Zaragoza': 'Zaragoza',
  'Ávila': 'Ávila',
};

/**
 * Convierte nombre de provincia en español (Supabase) al nombre en GeoJSON
 */
export function spanishToGeoJson(provinceName: string): string {
  return SPANISH_TO_GEOJSON[provinceName] || provinceName;
}

/**
 * Convierte nombre de provincia en GeoJSON al nombre en español (Supabase)
 */
export function geoJsonToSpanish(provinceName: string): string {
  return GEOJSON_TO_SPANISH[provinceName] || provinceName;
}

/**
 * Obtiene el nombre de provincia en GeoJSON desde datos de Supabase
 */
export function getGeoJsonProvinceName(supabaseProvinceName: string): string {
  return spanishToGeoJson(supabaseProvinceName);
}

/**
 * Obtiene el nombre de provincia en Supabase desde datos del GeoJSON
 */
export function getSupabaseProvinceName(geoJsonProvinceName: string): string {
  return geoJsonToSpanish(geoJsonProvinceName);
}
