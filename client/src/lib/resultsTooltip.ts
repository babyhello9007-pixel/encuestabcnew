export function formatExactVoteTooltip(votes: number, percentage: number, context = "del ámbito") {
  const safeVotes = Number.isFinite(votes) ? votes : 0;
  const safePercentage = Number.isFinite(percentage) ? percentage : 0;
  return `${safePercentage.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% ${context} equivale a ${safeVotes.toLocaleString("es-ES")} votos`;
}
