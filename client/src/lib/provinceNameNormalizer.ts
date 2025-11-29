/**
 * Normaliza nombres de provincias entre diferentes variantes
 * Mapea nombres de provincias a sus equivalentes en el GeoJSON de es-atlas
 */

// Mapeo de nombres de provincias a sus equivalentes en es-atlas
const PROVINCE_NAME_MAP: Record<string, string> = {
  // Variantes en español
  "Coruña": "A Coruña",
  "La Coruña": "A Coruña",
  "A Coruña": "A Coruña",
  
  "Vizcaya": "Bizkaia",
  "Bizkaia": "Bizkaia",
  
  "Guipúzcoa": "Gipuzkoa",
  "Gipuzkoa": "Gipuzkoa",
  
  "Álava": "Araba/Álava",
  "Araba": "Araba/Álava",
  "Araba/Álava": "Araba/Álava",
  
  // Islas Baleares
  "Baleares": "Illes Balears",
  "Illes Balears": "Illes Balears",
  "Islas Baleares": "Illes Balears",
  
  // Canarias - Las Palmas
  "Las Palmas": "Las Palmas",
  "Las Palmas de Gran Canaria": "Las Palmas",
  
  // Canarias - Santa Cruz de Tenerife
  "Santa Cruz de Tenerife": "Santa Cruz de Tenerife",
  "Tenerife": "Santa Cruz de Tenerife",
  
  // Ciudades autónomas
  "Ceuta": "Ceuta",
  "Melilla": "Melilla",
  
  // Variantes de otros nombres
  "Alicante": "Alacant/Alicante",
  "Alacant": "Alacant/Alicante",
  "Alacant/Alicante": "Alacant/Alicante",
  
  "Castellón": "Castelló/Castellón",
  "Castelló": "Castelló/Castellón",
  "Castelló/Castellón": "Castelló/Castellón",
  
  "Valencia": "València/Valencia",
  "València": "València/Valencia",
  "València/Valencia": "València/Valencia",
  
  "Asturias": "Asturias",
  "Oviedo": "Asturias",
};

/**
 * Normaliza el nombre de una provincia
 * @param provinceName Nombre de la provincia a normalizar
 * @returns Nombre normalizado según es-atlas
 */
export function normalizeProvinceName(provinceName: string | null | undefined): string | null {
  if (!provinceName) return null;
  
  // Trimear espacios
  const trimmed = provinceName.trim();
  
  // Buscar en el mapa de normalización
  if (PROVINCE_NAME_MAP[trimmed]) {
    return PROVINCE_NAME_MAP[trimmed];
  }
  
  // Si no encuentra, retornar el nombre original
  return trimmed;
}

/**
 * Obtiene todas las variantes posibles de un nombre de provincia
 * @param provinceName Nombre de la provincia
 * @returns Array de variantes posibles
 */
export function getProvinceNameVariants(provinceName: string | null | undefined): string[] {
  if (!provinceName) return [];
  
  const normalized = normalizeProvinceName(provinceName);
  if (!normalized) return [];
  
  const variants = new Set<string>();
  
  // Agregar el nombre normalizado
  variants.add(normalized);
  
  // Agregar variantes comunes
  switch (normalized) {
    case "A Coruña":
      variants.add("Coruña");
      variants.add("La Coruña");
      break;
    case "Bizkaia":
      variants.add("Vizcaya");
      break;
    case "Gipuzkoa":
      variants.add("Guipúzcoa");
      break;
    case "Araba/Álava":
      variants.add("Álava");
      variants.add("Araba");
      break;
    case "Illes Balears":
      variants.add("Baleares");
      variants.add("Islas Baleares");
      break;
    case "Alacant/Alicante":
      variants.add("Alicante");
      variants.add("Alacant");
      break;
    case "Castelló/Castellón":
      variants.add("Castellón");
      variants.add("Castelló");
      break;
    case "València/Valencia":
      variants.add("Valencia");
      variants.add("València");
      break;
  }
  
  return Array.from(variants);
}

/**
 * Verifica si un nombre de provincia es válido según es-atlas
 * @param provinceName Nombre de la provincia
 * @returns true si es válido
 */
export function isValidProvinceName(provinceName: string | null | undefined): boolean {
  const normalized = normalizeProvinceName(provinceName);
  return normalized !== null && normalized !== undefined;
}
