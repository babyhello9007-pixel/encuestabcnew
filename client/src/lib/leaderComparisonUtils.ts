/** Calcula la diferencia porcentual del líder principal frente al comparado. */
export function calculateComparisonDifference(
  primaryAverage: number,
  comparisonAverage: number | null
): number | null {
  if (comparisonAverage === null || comparisonAverage === 0) return null;
  return ((primaryAverage - comparisonAverage) / comparisonAverage) * 100;
}

/** Obtiene únicamente los favoritos guardados para el líder abierto actualmente. */
export function getFavoritesForLeader<T extends { leaderName: string }>(
  favorites: T[],
  leaderName: string
): T[] {
  return favorites.filter((favorite) => favorite.leaderName === leaderName);
}
