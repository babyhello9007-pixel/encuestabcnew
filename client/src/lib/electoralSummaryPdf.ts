import { jsPDF } from "jspdf";
import "jspdf-autotable";

export interface ElectoralPdfParty {
  partido: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  barometro: number;
  mediaEncuestas: number;
  edadMedia?: number | null;
  lider?: string | null;
  apoyoLider?: number | null;
  color?: string;
}

export interface ElectoralPdfContext {
  titulo: string;
  respuestas: number;
  ambito: string;
  ccaa: string;
  provincia: string;
  edad: string;
  edadPromedio?: number | null;
  ideologiaPromedio?: number | null;
  notaEjecutivo?: number | null;
  abstencionBarometro?: number | null;
  nivelCabreo?: number | null;
  totalEscanos: number;
  umbral: string;
  tipoEleccion: string;
  generadoEn?: Date;
}

export function buildElectoralPdfRows(parties: ElectoralPdfParty[]) {
  return [...parties]
    .sort((a, b) => b.votos - a.votos || b.escanos - a.escanos || a.partido.localeCompare(b.partido, "es"))
    .map((party, index) => [
      String(index + 1),
      party.partido,
      party.votos.toLocaleString("es-ES"),
      `${party.porcentaje.toFixed(2)}%`,
      String(party.escanos),
      String(party.barometro),
      String(party.mediaEncuestas),
      party.edadMedia == null ? "—" : `${party.edadMedia.toFixed(1)} años`,
      party.lider || "—",
      party.apoyoLider == null ? "—" : `${party.apoyoLider.toFixed(1)}%`,
    ]);
}

function safeNumber(value: number | null | undefined, suffix = "") {
  return value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}${suffix}`;
}

function addFooter(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    doc.setDrawColor(218, 222, 230);
    doc.line(14, height - 13, width - 14, height - 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 108, 122);
    doc.text("Batalla Cultural · Resultados electorales", 14, height - 7);
    doc.text(`Página ${page} de ${pages}`, width - 14, height - 7, { align: "right" });
  }
}

export function exportElectoralSummaryPdf(parties: ElectoralPdfParty[], context: ElectoralPdfContext) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const generatedAt = context.generadoEn ?? new Date();
  const dateLabel = generatedAt.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const timeLabel = generatedAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  doc.setFillColor(12, 17, 32);
  doc.rect(0, 0, pageWidth, 31, "F");
  doc.setFillColor(220, 38, 52);
  doc.rect(0, 28, pageWidth, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("BATALLA CULTURAL", 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Informe electoral · resumen para impresión", 14, 21);
  doc.setFontSize(8);
  doc.text(`${dateLabel} · ${timeLabel}`, pageWidth - 14, 21, { align: "right" });

  let y = 42;
  doc.setTextColor(20, 26, 38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(context.titulo, 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(82, 92, 108);
  doc.text(`Ámbito analizado: ${context.ambito}`, 14, y);
  y += 5;
  doc.text(`Filtros · CCAA: ${context.ccaa} · Provincia: ${context.provincia} · Edad: ${context.edad}`, 14, y);
  y += 10;

  const summaryRows = [
    ["Respuestas analizadas", context.respuestas.toLocaleString("es-ES")],
    ["Escaños en juego", context.totalEscanos.toLocaleString("es-ES")],
    ["Umbral electoral", context.umbral],
    ["Edad media", safeNumber(context.edadPromedio, " años")],
    ["Ideología media", safeNumber(context.ideologiaPromedio, " / 10")],
    ["Media valoración del Gobierno", safeNumber(context.notaEjecutivo, " / 10")],
    ["Abstención BarómetroBC", safeNumber(context.abstencionBarometro, "%")],
    ["Nivel de cabreo", safeNumber(context.nivelCabreo, " / 10")],
  ];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 26, 38);
  doc.text("Resumen ejecutivo", 14, y);
  (doc as any).autoTable({
    startY: y + 4,
    head: [["Indicador", "Valor"]],
    body: summaryRows,
    theme: "grid",
    margin: { left: 14, right: 14 },
    tableWidth: 92,
    styles: { font: "helvetica", fontSize: 9, cellPadding: 3, textColor: [35, 42, 55] },
    headStyles: { fillColor: [220, 38, 52], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 248, 251] },
    columnStyles: { 0: { cellWidth: 59 }, 1: { cellWidth: 33, halign: "right", fontStyle: "bold" } },
  });
  y = ((doc as any).lastAutoTable?.finalY ?? y + 70) + 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 26, 38);
  doc.text("Resultados por partido", 14, y);
  y += 4;
  const tableRows = buildElectoralPdfRows(parties);
  (doc as any).autoTable({
    startY: y,
    head: [["#", "Partido", "Votos", "%", "Esc.", "Barómetro", "Media", "Edad media", "Líder mejor valorado", "Apoyo"]],
    body: tableRows,
    theme: "grid",
    margin: { left: 8, right: 8, top: 18, bottom: 18 },
    styles: { font: "helvetica", fontSize: 7.2, cellPadding: 2, textColor: [35, 42, 55], overflow: "linebreak", valign: "middle" },
    headStyles: { fillColor: [12, 17, 32], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 7.2 },
    alternateRowStyles: { fillColor: [247, 248, 251] },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 31, fontStyle: "bold" },
      2: { cellWidth: 17, halign: "right" },
      3: { cellWidth: 12, halign: "right" },
      4: { cellWidth: 11, halign: "right" },
      5: { cellWidth: 17, halign: "right" },
      6: { cellWidth: 15, halign: "right" },
      7: { cellWidth: 20, halign: "right" },
      8: { cellWidth: 38 },
      9: { cellWidth: 13, halign: "right" },
    },
    didDrawPage: (data: any) => {
      if (data.pageNumber > 1) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(20, 26, 38);
        doc.text(`${context.titulo} · resultados por partido`, 14, 12);
      }
    },
  });

  const finalY = ((doc as any).lastAutoTable?.finalY ?? y + 30) + 12;
  const availableHeight = doc.internal.pageSize.getHeight() - 28;
  if (finalY > availableHeight - 35) doc.addPage();
  let noteY = finalY > availableHeight - 35 ? 24 : finalY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 26, 38);
  doc.text("Lectura metodológica", 14, noteY);
  noteY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(82, 92, 108);
  const note = `Los escaños de ${context.tipoEleccion} se calculan aplicando la Ley d’Hondt por provincia, respetando el cupo territorial y el umbral del ${context.umbral}. La columna Media corresponde a la media de encuestas disponible para cada partido; los valores no disponibles se muestran como 0 en pantalla y como 0 en la tabla exportada.`;
  const lines = doc.splitTextToSize(note, pageWidth - 28);
  doc.text(lines, 14, noteY, { maxWidth: pageWidth - 28 });
  addFooter(doc);

  const filename = `resumen-electoral-batalla-cultural-${generatedAt.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
}
