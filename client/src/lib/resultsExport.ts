export interface ResultsExportRow {
  partido: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  barometro: number;
  media: number;
}

export interface ResultsExportContext {
  titulo: string;
  respuestas: number;
  ccaa: string;
  provincia: string;
  edad: string;
  generadoEn?: string;
}

function csvEscape(value: string | number): string {
  const normalized = String(value ?? "");
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES").format(Number.isFinite(value) ? value : 0);
}

function formatPercentage(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "0,0";
}

export function buildResultsCsv(rows: ResultsExportRow[], context: ResultsExportContext): string {
  const header = ["Partido", "Votos", "Porcentaje", "Escaños EncuestaBC", "BarómetroBC", "Media de encuestas"];
  const metadata = [
    ["Informe", context.titulo],
    ["Respuestas analizadas", context.respuestas],
    ["Comunidad autónoma", context.ccaa],
    ["Provincia", context.provincia],
    ["Rango de edad", context.edad],
    ["Generado", context.generadoEn || new Date().toISOString()],
  ];
  const lines = metadata.map(([label, value]) => `${csvEscape(label)},${csvEscape(value)}`);
  lines.push("");
  lines.push(header.map(csvEscape).join(","));
  rows.forEach(row => {
    lines.push([
      row.partido,
      formatNumber(row.votos),
      formatPercentage(row.porcentaje),
      row.escanos,
      row.barometro,
      row.media,
    ].map(csvEscape).join(","));
  });
  return `\uFEFF${lines.join("\n")}`;
}

export function buildResultsExcelHtml(rows: ResultsExportRow[], context: ResultsExportContext): string {
  const metaRows = [
    ["Informe", context.titulo],
    ["Respuestas analizadas", formatNumber(context.respuestas)],
    ["Comunidad autónoma", context.ccaa],
    ["Provincia", context.provincia],
    ["Rango de edad", context.edad],
    ["Generado", context.generadoEn || new Date().toLocaleString("es-ES")],
  ];
  const metadata = metaRows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("");
  const body = rows.map(row => `<tr><td>${escapeHtml(row.partido)}</td><td>${formatNumber(row.votos)}</td><td>${formatPercentage(row.porcentaje)}%</td><td>${row.escanos}</td><td>${row.barometro}</td><td>${row.media}</td></tr>`).join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(context.titulo)}</title><style>body{font-family:TVP,Arial,sans-serif;color:#172033;padding:24px}h1{color:#991b1b}table{border-collapse:collapse;width:100%;margin:16px 0}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}thead th{background:#e2e8f0}caption{text-align:left;font-weight:700;margin:16px 0 6px}</style></head><body><h1>${escapeHtml(context.titulo)}</h1><table><tbody>${metadata}</tbody></table><table><caption>Resultados por partido</caption><thead><tr><th>Partido</th><th>Votos</th><th>Porcentaje</th><th>Escaños EncuestaBC</th><th>BarómetroBC</th><th>Media de encuestas</th></tr></thead><tbody>${body}</tbody></table></body></html>`;
}

function escapeHtml(value: string | number): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
