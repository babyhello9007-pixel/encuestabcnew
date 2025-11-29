/**
 * Mapeo de provincias a Comunidades Autónomas (CCAA)
 * Usado para validación de consistencia y autocompletado
 */

export const PROVINCE_TO_CCAA: Record<string, string> = {
  // Andalucía (8)
  'Almería': 'Andalucía',
  'Cádiz': 'Andalucía',
  'Córdoba': 'Andalucía',
  'Granada': 'Andalucía',
  'Huelva': 'Andalucía',
  'Jaén': 'Andalucía',
  'Málaga': 'Andalucía',
  'Sevilla': 'Andalucía',

  // Aragón (3)
  'Huesca': 'Aragón',
  'Teruel': 'Aragón',
  'Zaragoza': 'Aragón',

  // Asturias (1)
  'Asturias': 'Asturias',

  // Islas Baleares (1)
  'Illes Balears': 'Islas Baleares',

  // Canarias (2)
  'Las Palmas': 'Canarias',
  'Santa Cruz de Tenerife': 'Canarias',

  // Cantabria (1)
  'Cantabria': 'Cantabria',

  // Castilla-La Mancha (5)
  'Albacete': 'Castilla-La Mancha',
  'Ciudad Real': 'Castilla-La Mancha',
  'Cuenca': 'Castilla-La Mancha',
  'Guadalajara': 'Castilla-La Mancha',
  'Toledo': 'Castilla-La Mancha',

  // Castilla y León (9)
  'Ávila': 'Castilla y León',
  'Burgos': 'Castilla y León',
  'León': 'Castilla y León',
  'Palencia': 'Castilla y León',
  'Salamanca': 'Castilla y León',
  'Segovia': 'Castilla y León',
  'Soria': 'Castilla y León',
  'Valladolid': 'Castilla y León',
  'Zamora': 'Castilla y León',

  // Cataluña (4)
  'Barcelona': 'Cataluña',
  'Girona': 'Cataluña',
  'Lleida': 'Cataluña',
  'Tarragona': 'Cataluña',

  // Comunidad Valenciana (3)
  'Alicante': 'Comunidad Valenciana',
  'Castellón': 'Comunidad Valenciana',
  'Valencia': 'Comunidad Valenciana',

  // Extremadura (2)
  'Badajoz': 'Extremadura',
  'Cáceres': 'Extremadura',

  // Galicia (4)
  'A Coruña': 'Galicia',
  'Lugo': 'Galicia',
  'Ourense': 'Galicia',
  'Pontevedra': 'Galicia',

  // La Rioja (1)
  'La Rioja': 'La Rioja',

  // Madrid (1)
  'Madrid': 'Madrid',

  // Murcia (1)
  'Murcia': 'Murcia',

  // Navarra (1)
  'Navarra': 'Navarra',

  // País Vasco (3)
  'Álava': 'País Vasco',
  'Bizkaia': 'País Vasco',
  'Gipuzkoa': 'País Vasco',

  // Ceuta y Melilla (2)
  'Ceuta': 'Ceuta',
  'Melilla': 'Melilla'
};

/**
 * Obtener la CCAA correspondiente a una provincia
 */
export function getCCAAFromProvince(province: string): string | undefined {
  return PROVINCE_TO_CCAA[province];
}

/**
 * Validar si una provincia pertenece a una CCAA
 */
export function isProvinceInCCAA(province: string, ccaa: string): boolean {
  const provinceCCAA = PROVINCE_TO_CCAA[province];
  return provinceCCAA === ccaa;
}

/**
 * Obtener todas las provincias de una CCAA
 */
export function getProvincesInCCAA(ccaa: string): string[] {
  return Object.entries(PROVINCE_TO_CCAA)
    .filter(([_, caa]) => caa === ccaa)
    .map(([province, _]) => province);
}
