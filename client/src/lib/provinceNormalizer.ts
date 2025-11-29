/**
 * Normaliza nombres de provincias para asegurar consistencia en la base de datos
 * Convierte nombres alternativos a los nombres oficiales del sistema electoral
 */

export function normalizeProvinceName(province: string | null | undefined): string | null {
  if (!province) return null;

  // Mapa de nombres alternativos a nombres oficiales
  const provinceMap: Record<string, string> = {
    'Vizcaya': 'Bizkaia',
    'Guipúzcoa': 'Gipuzkoa',
  };

  // Retornar el nombre normalizado o el original si no está en el mapa
  return provinceMap[province] || province;
}

/**
 * Normaliza un objeto de respuestas de encuesta
 */
export function normalizeProvinceInResponse(response: Record<string, any>): Record<string, any> {
  return {
    ...response,
    provincia: normalizeProvinceName(response.provincia),
  };
}
