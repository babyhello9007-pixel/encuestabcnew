/**
 * Mapeo entre nombres de provincias en TopoJSON y nombres en la encuesta
 */

export const TOPOJSON_TO_SURVEY_MAPPING: Record<string, string> = {
  // Nombres directos
  'Albacete': 'Albacete',
  'Ávila': 'Ávila',
  'Badajoz': 'Badajoz',
  'Illes Balears': 'Illes Balears',
  'Barcelona': 'Barcelona',
  'Burgos': 'Burgos',
  'Cáceres': 'Cáceres',
  'Cádiz': 'Cádiz',
  'Ciudad Real': 'Ciudad Real',
  'Córdoba': 'Córdoba',
  'A Coruña': 'A Coruña',
  'Cuenca': 'Cuenca',
  'Girona': 'Girona',
  'Granada': 'Granada',
  'Guadalajara': 'Guadalajara',
  'Gipuzkoa': 'Gipuzkoa',
  'Huelva': 'Huelva',
  'Huesca': 'Huesca',
  'Jaén': 'Jaén',
  'León': 'León',
  'Lleida': 'Lleida',
  'La Rioja': 'La Rioja',
  'Lugo': 'Lugo',
  'Madrid': 'Madrid',
  'Málaga': 'Málaga',
  'Murcia': 'Murcia',
  'Navarra': 'Navarra',
  'Ourense': 'Ourense',
  'Asturias': 'Asturias',
  'Palencia': 'Palencia',
  'Pontevedra': 'Pontevedra',
  'Salamanca': 'Salamanca',
  'Cantabria': 'Cantabria',
  'Segovia': 'Segovia',
  'Sevilla': 'Sevilla',
  'Soria': 'Soria',
  'Tarragona': 'Tarragona',
  'Teruel': 'Teruel',
  'Toledo': 'Toledo',
  'Valladolid': 'Valladolid',
  'Bizkaia': 'Bizkaia',
  'Zamora': 'Zamora',
  'Zaragoza': 'Zaragoza',
  'Ceuta': 'Ceuta',
  'Melilla': 'Melilla',
  'Las Palmas': 'Las Palmas',
  'Santa Cruz de Tenerife': 'Santa Cruz de Tenerife',

  // Nombres con barra diagonal (TopoJSON)
  'Alacant/Alicante': 'Alicante',
  'Castelló/Castellón': 'Castellón',
  'Araba/Álava': 'Álava',
  'València/Valencia': 'Valencia',

  // Variantes
  'Alicante': 'Alicante',
  'Castellón': 'Castellón',
  'Álava': 'Álava',
  'Valencia': 'Valencia',

  // Nombres en valenciano/euskera sin barra diagonal
  'Araba': 'Álava',
  'Alacant': 'Alicante',
  'Castelló': 'Castellón',
  'València': 'Valencia',
};

/**
 * Obtiene el nombre de la encuesta a partir del nombre en TopoJSON
 */
export function getProvinceNameFromTopoJSON(topoJsonName: string): string | null {
  return TOPOJSON_TO_SURVEY_MAPPING[topoJsonName] || null;
}

/**
 * Verifica si una provincia existe en el mapeo
 */
export function isValidProvince(topoJsonName: string): boolean {
  return topoJsonName in TOPOJSON_TO_SURVEY_MAPPING;
}
