/**
 * Implementación de la Ley d'Hondt para cálculo de escaños
 * @param votos - Objeto con los votos por partido/asociación
 * @param totalEscanos - Número total de escaños a distribuir
 * @param umbralPorcentaje - Umbral mínimo de porcentaje para participar
 * @returns Objeto con los escaños asignados a cada partido/asociación
 */
export function calcularEscanosDHondt(
  votos: Record<string, number>,
  totalEscanos: number,
  umbralPorcentaje: number
): Record<string, number> {
  // Calcular total de votos
  const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);
  
  if (totalVotos === 0) {
    return {};
  }

  // Filtrar partidos que superan el umbral
  const umbralVotos = (totalVotos * umbralPorcentaje) / 100;
  const partidosFiltrados: Array<[string, number]> = Object.entries(votos).filter(
    ([_, votoCount]) => votoCount >= umbralVotos
  );

  // Crear matriz de divisores
  const escanos: Record<string, number> = {};
  const divisores: Array<[string, number, number]> = []; // [partido, divisor, escanos_asignados]

  // Inicializar
  for (const [partido] of partidosFiltrados) {
    escanos[partido] = 0;
  }

  // Asignar escaños uno a uno
  for (let i = 0; i < totalEscanos; i++) {
    let mejorPartido = '';
    let mejorCociente = 0;

    // Encontrar el partido con el mayor cociente
    for (const [partido, votoCount] of partidosFiltrados) {
      const divisor = escanos[partido] + 1;
      const cociente = votoCount / divisor;

      if (cociente > mejorCociente) {
        mejorCociente = cociente;
        mejorPartido = partido;
      }
    }

    // Asignar un escaño al partido con mayor cociente
    if (mejorPartido) {
      escanos[mejorPartido]++;
    }
  }

  return escanos;
}

/**
 * Calcula escaños para elecciones generales (350 escaños, umbral 3%)
 */
export function calcularEscanosGenerales(votos: Record<string, number>): Record<string, number> {
  return calcularEscanosDHondt(votos, 350, 3);
}

/**
 * Calcula escaños para asociaciones juveniles (50 escaños, umbral 7%)
 */
export function calcularEscanosJuveniles(votos: Record<string, number>): Record<string, number> {
  return calcularEscanosDHondt(votos, 50, 7);
}

/**
 * Obtiene estadísticas de votos y escaños
 */
export function obtenerEstadisticas(
  votos: Record<string, number>,
  escanos: Record<string, number>,
  nombres: Record<string, string>,
  logos: Record<string, string>
): Array<{
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
}> {
  const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);

  const seenIds = new Set<string>();
  
  return Object.entries(votos)
    .filter(([id, votoCount]) => {
      if (votoCount <= 0 || seenIds.has(id)) {
        return false;
      }
      seenIds.add(id);
      return true;
    })
    .map(([id, votoCount]) => ({
      id,
      nombre: nombres[id] || id,
      votos: votoCount,
      porcentaje: totalVotos > 0 ? (votoCount / totalVotos) * 100 : 0,
      escanos: escanos[id] || 0,
      logo: logos[id] || '',
    }))
    .sort((a, b) => b.votos - a.votos);
}

