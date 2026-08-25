export interface ResultsSharePayload {
  title: string;
  text: string;
  url: string;
}

export function buildResultsSharePayload(origin: string, activeTab: string, totalResponses: number): ResultsSharePayload {
  const query = new URLSearchParams({ tab: activeTab });
  const normalizedOrigin = origin.replace(/\/+$/, "");
  return {
    title: "Resultados · Batalla Cultural",
    text: `Consulta los resultados en vivo de Batalla Cultural: ${totalResponses.toLocaleString("es-ES")} respuestas.`,
    url: `${normalizedOrigin}/resultados?${query.toString()}`,
  };
}
