import { jsPDF } from "jspdf";

export interface ProvincialBreakdownExportRow {
  ccaa: string;
  provincia: string;
  cupoEscanos: number;
  votos: number;
  porcentajeVoto: number;
  escanosAsignados: number;
  partidos: string;
}

export interface ProvincialBreakdownExportContext {
  titulo: string;
  respuestas: number;
  ambito: string;
  generadoEn?: string;
}

function csvEscape(value: string | number): string {
  const normalized = String(value ?? "");
  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-ES").format(Number.isFinite(value) ? value : 0);
}

export function buildProvincialBreakdownCsv(
  rows: ProvincialBreakdownExportRow[],
  context: ProvincialBreakdownExportContext,
): string {
  const metadata = [
    ["Informe", context.titulo],
    ["Respuestas analizadas", formatNumber(context.respuestas)],
    ["Ámbito", context.ambito],
    ["Generado", context.generadoEn || new Date().toISOString()],
  ];
  const header = ["Comunidad autónoma", "Provincia", "Cupo provincial", "Votos válidos", "% del ámbito", "Escaños asignados", "Partidos y escaños"];
  const lines = metadata.map(([label, value]) => `${csvEscape(label)},${csvEscape(value)}`);
  lines.push("");
  lines.push(header.map(csvEscape).join(","));
  rows.forEach((row) => {
    lines.push([
      row.ccaa,
      row.provincia,
      row.cupoEscanos,
      formatNumber(row.votos),
      row.porcentajeVoto.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      row.escanosAsignados,
      row.partidos,
    ].map(csvEscape).join(","));
  });
  return `\uFEFF${lines.join("\n")}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return [196, 30, 58];
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

export function createProvincialBreakdownPdf(
  rows: ProvincialBreakdownExportRow[],
  context: ProvincialBreakdownExportContext,
): jsPDF {
  const doc = new jsPDF("l", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const tableWidth = pageWidth - margin * 2;
  const columnWidths = [44, 44, 30, 31, 27, 34, tableWidth - 44 - 44 - 30 - 31 - 27 - 34];
  const rowHeight = 7;
  let y = 31;

  doc.setFillColor(...hexToRgb("#0d1328"));
  doc.rect(0, 0, pageWidth, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(context.titulo, margin, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Ámbito: ${context.ambito} · ${formatNumber(context.respuestas)} respuestas · ${context.generadoEn || new Date().toLocaleString("es-ES")}`, margin, 19);

  const headers = ["Comunidad autónoma", "Provincia", "Cupo", "Votos válidos", "% ámbito", "Escaños", "Partidos y escaños"];
  const drawHeader = () => {
    doc.setFillColor(...hexToRgb("#c41e3a"));
    doc.rect(margin, y, tableWidth, rowHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    let x = margin;
    headers.forEach((header, index) => {
      doc.text(header, x + 2, y + 4.7, { maxWidth: columnWidths[index] - 4 });
      x += columnWidths[index];
    });
    y += rowHeight;
  };

  drawHeader();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  rows.forEach((row, index) => {
    if (y + rowHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeader();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
    }
    if (index % 2 === 1) {
      doc.setFillColor(246, 248, 252);
      doc.rect(margin, y, tableWidth, rowHeight, "F");
    }
    doc.setDrawColor(218, 223, 232);
    doc.rect(margin, y, tableWidth, rowHeight);
    const values = [row.ccaa, row.provincia, String(row.cupoEscanos), formatNumber(row.votos), `${row.porcentajeVoto.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`, String(row.escanosAsignados), row.partidos || "—"];
    let x = margin;
    values.forEach((value, valueIndex) => {
      doc.setTextColor(25, 32, 48);
      doc.text(value, x + 2, y + 4.6, { maxWidth: columnWidths[valueIndex] - 4 });
      x += columnWidths[valueIndex];
    });
    y += rowHeight;
  });

  doc.setTextColor(100, 108, 124);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Batalla Cultural · Desglose provincial calculado con los cupos oficiales de cada circunscripción", margin, pageHeight - 5);
  return doc;
}

export function downloadProvincialBreakdownPdf(
  rows: ProvincialBreakdownExportRow[],
  context: ProvincialBreakdownExportContext,
): void {
  const doc = createProvincialBreakdownPdf(rows, context);
  doc.save(`desglose-provincial-batalla-cultural-${new Date().toISOString().slice(0, 10)}.pdf`);
}
