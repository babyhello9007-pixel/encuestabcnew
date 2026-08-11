export type PositionMovement = "up" | "down" | "same" | "new";

export interface PositionIndicator {
  movement: PositionMovement;
  previousPosition: number | null;
  currentPosition: number;
  delta: number;
}

export function getLeaderPositionKey(leaderName: string): string {
  return leaderName.trim().toLocaleLowerCase();
}

export function compareLeaderPositions(
  previousRanking: string[],
  currentRanking: string[]
): Record<string, PositionIndicator> {
  const previousPositions = new Map(
    previousRanking.map((name, index) => [getLeaderPositionKey(name), index + 1])
  );

  return Object.fromEntries(
    currentRanking.map((name, index) => {
      const currentPosition = index + 1;
      const previousPosition = previousPositions.get(getLeaderPositionKey(name)) ?? null;
      const delta = previousPosition === null ? 0 : previousPosition - currentPosition;
      const movement: PositionMovement =
        previousPosition === null ? "new" : delta > 0 ? "up" : delta < 0 ? "down" : "same";

      return [getLeaderPositionKey(name), {
        movement,
        previousPosition,
        currentPosition,
        delta,
      } satisfies PositionIndicator];
    })
  );
}
