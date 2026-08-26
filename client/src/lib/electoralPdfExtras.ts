export interface ElectoralExtraResponse {
  comunidad_autonoma?: string | null;
  voto_generales?: string | null;
  anteriores_eegg?: string | null;
}

export interface ElectoralPdfRegion {
  region: string;
  votos: number;
  porcentaje: number;
}

export interface ElectoralPdfFlow {
  origen: string;
  destino: string;
  votos: number;
}

export function buildElectoralPdfExtras(rows: ElectoralExtraResponse[], regionLimit = 5, flowLimit = 12) {
  const regions = new Map<string, number>();
  const flows = new Map<string, ElectoralPdfFlow>();
  rows.forEach((row) => {
    const region = String(row.comunidad_autonoma ?? "").trim();
    if (region) regions.set(region, (regions.get(region) ?? 0) + 1);
    const origen = String(row.anteriores_eegg ?? "").trim();
    const destino = String(row.voto_generales ?? "").trim();
    if (!origen || !destino) return;
    const key = `${origen}\u0000${destino}`;
    const previous = flows.get(key);
    flows.set(key, previous ? { ...previous, votos: previous.votos + 1 } : { origen, destino, votos: 1 });
  });
  const totalRegionVotes = Array.from(regions.values()).reduce((sum, value) => sum + value, 0);
  const topRegions: ElectoralPdfRegion[] = Array.from(regions.entries())
    .sort(([regionA, votesA], [regionB, votesB]) => votesB - votesA || regionA.localeCompare(regionB, "es"))
    .slice(0, regionLimit)
    .map(([region, votos]) => ({ region, votos, porcentaje: totalRegionVotes ? (votos / totalRegionVotes) * 100 : 0 }));
  const sankeyFlows = Array.from(flows.values())
    .sort((a, b) => b.votos - a.votos || a.origen.localeCompare(b.origen, "es") || a.destino.localeCompare(b.destino, "es"))
    .slice(0, flowLimit);
  return { topRegions, sankeyFlows };
}
