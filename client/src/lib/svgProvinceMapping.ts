/**
 * Mapeo de IDs del SVG de Wikipedia a nombres de provincias españolas
 */
export const SVG_PROVINCE_MAPPING: Record<string, string> = {
  // Galicia
  "pr_la_corunya": "La Coruña",
  "pr_lugo": "Lugo",
  "pr_ourense": "Ourense",
  "pr_pontevedra": "Pontevedra",
  
  // Asturias y Cantabria
  "pr_asturias": "Asturias",
  "pr_cantabria": "Cantabria",
  
  // País Vasco
  "pr_vizcaya": "Vizcaya",
  "pr_guipuzcoa": "Guipúzcoa",
  "pr_alava": "Álava",
  
  // Navarra y La Rioja
  "pr_navarra": "Navarra",
  "pr_la_rioja": "La Rioja",
  
  // Aragón
  "pr_huesca": "Huesca",
  "pr_teruel": "Teruel",
  "pr_zaragoza": "Zaragoza",
  
  // Cataluña
  "pr_barcelona": "Barcelona",
  "pr_girona": "Girona",
  "pr_lleida": "Lleida",
  "pr_tarragona": "Tarragona",
  
  // Castilla y León
  "pr_leon": "León",
  "pr_palencia": "Palencia",
  "pr_valladolid": "Valladolid",
  "pr_burgos": "Burgos",
  "pr_soria": "Soria",
  "pr_segovia": "Segovia",
  "pr_avila": "Ávila",
  "pr_salamanca": "Salamanca",
  "pr_zamora": "Zamora",
  
  // Madrid
  "pr_madrid": "Madrid",
  
  // Castilla-La Mancha
  "pr_guadalajara": "Guadalajara",
  "pr_cuenca": "Cuenca",
  "pr_ciudad_real": "Ciudad Real",
  "pr_albacete": "Albacete",
  "pr_toledo": "Toledo",
  
  // Extremadura
  "pr_caceres": "Cáceres",
  "pr_badajoz": "Badajoz",
  
  // Comunidad Valenciana
  "pr_castellon": "Castellón",
  "pr_valencia": "Valencia",
  "pr_alicante": "Alicante",
  
  // Murcia
  "pr_murcia": "Murcia",
  
  // Andalucía
  "pr_jaen": "Jaén",
  "pr_cordoba": "Córdoba",
  "pr_sevilla": "Sevilla",
  "pr_huelva": "Huelva",
  "pr_cadiz": "Cádiz",
  "pr_malaga": "Málaga",
  "pr_granada": "Granada",
  "pr_almeria": "Almería",
  
  // Ciudades autónomas
  "pr_ceuta": "Ceuta",
  "pr_melilla": "Melilla",
};

/**
 * Mapeo inverso: nombres de provincias a IDs del SVG
 */
export const PROVINCE_TO_SVG_ID: Record<string, string> = Object.fromEntries(
  Object.entries(SVG_PROVINCE_MAPPING).map(([id, name]) => [name, id])
);

/**
 * Obtener el ID del SVG para una provincia
 */
export function getSVGIdForProvince(provinceName: string): string | null {
  return PROVINCE_TO_SVG_ID[provinceName] || null;
}

/**
 * Obtener el nombre de la provincia para un ID del SVG
 */
export function getProvinceNameFromSVGId(svgId: string): string | null {
  return SVG_PROVINCE_MAPPING[svgId] || null;
}

/**
 * Obtener todos los IDs del SVG
 */
export function getAllSVGIds(): string[] {
  return Object.keys(SVG_PROVINCE_MAPPING);
}

/**
 * Obtener todas las provincias
 */
export function getAllProvinces(): string[] {
  return Object.values(SVG_PROVINCE_MAPPING);
}
