import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import type { ElectoralPdfFlow, ElectoralPdfRegion } from "./electoralPdfExtras";

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
  regionesDestacadas?: ElectoralPdfRegion[];
  sankeyFlujos?: ElectoralPdfFlow[];
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

export type ElectoralPdfOrientation = "portrait" | "landscape";

export function buildElectoralSummaryPdf(parties: ElectoralPdfParty[], context: ElectoralPdfContext, orientation: ElectoralPdfOrientation = "portrait") {
  const doc = new jsPDF(orientation, "mm", "a4");
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
  autoTable(doc, {
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
  autoTable(doc, {
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
  let noteY = finalY;
  const topRegions = context.regionesDestacadas ?? [];
  const sankeyFlows = context.sankeyFlujos ?? [];
  if (topRegions.length || sankeyFlows.length) {
    doc.addPage();
    let extrasY = 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 26, 38);
    doc.text("Lectura territorial y transferencia de voto", 14, extrasY);
    extrasY += 8;
    if (topRegions.length) {
      autoTable(doc, {
        startY: extrasY,
        head: [["Región destacada", "Respuestas", "% del ámbito"]],
        body: topRegions.map((region) => [region.region, region.votos.toLocaleString("es-ES"), `${region.porcentaje.toFixed(1)}%`]),
        theme: "grid",
        margin: { left: 14, right: 14 },
        styles: { font: "helvetica", fontSize: 9, cellPadding: 3, textColor: [35, 42, 55] },
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [247, 248, 251] },
        columnStyles: { 0: { cellWidth: 90, fontStyle: "bold" }, 1: { cellWidth: 42, halign: "right" }, 2: { cellWidth: 42, halign: "right" } },
      });
      extrasY = ((doc as any).lastAutoTable?.finalY ?? extrasY + 30) + 14;
    }
    if (sankeyFlows.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 26, 38);
      doc.text("Sankey de transferencia de voto", 14, extrasY);
      extrasY += 6;
      const originTotals = new Map<string, number>();
      const destinationTotals = new Map<string, number>();
      sankeyFlows.forEach((flow) => {
        originTotals.set(flow.origen, (originTotals.get(flow.origen) ?? 0) + flow.votos);
        destinationTotals.set(flow.destino, (destinationTotals.get(flow.destino) ?? 0) + flow.votos);
      });
      const origins = Array.from(originTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 7);
      const destinations = Array.from(destinationTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 7);
      const diagramTop = extrasY + 5;
      const diagramHeight = Math.min(92, Math.max(48, Math.max(origins.length, destinations.length) * 13));
      const leftX = 18;
      const rightX = pageWidth - 52;
      const nodeWidth = 28;
      const yFor = (index: number, count: number) => diagramTop + (index + 0.5) * (diagramHeight / Math.max(count, 1));
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      origins.forEach(([label, total], index) => {
        const nodeY = yFor(index, origins.length) - 3;
        doc.setFillColor(220, 38, 52);
        doc.roundedRect(leftX, nodeY, nodeWidth, 6, 1.5, 1.5, "F");
        doc.setTextColor(20, 26, 38);
        doc.text(`${label.slice(0, 14)} (${total})`, leftX, nodeY - 2);
      });
      destinations.forEach(([label, total], index) => {
        const nodeY = yFor(index, destinations.length) - 3;
        doc.setFillColor(37, 99, 235);
        doc.roundedRect(rightX, nodeY, nodeWidth, 6, 1.5, 1.5, "F");
        doc.setTextColor(20, 26, 38);
        doc.text(`${label.slice(0, 14)} (${total})`, rightX, nodeY - 2, { align: "right" });
      });
      sankeyFlows.slice(0, 12).forEach((flow, index) => {
        const originIndex = origins.findIndex(([label]) => label === flow.origen);
        const destinationIndex = destinations.findIndex(([label]) => label === flow.destino);
        if (originIndex < 0 || destinationIndex < 0) return;
        const y1 = yFor(originIndex, origins.length);
        const y2 = yFor(destinationIndex, destinations.length);
        doc.setDrawColor(140, 148, 165);
        doc.setLineWidth(Math.max(0.35, Math.min(2.2, flow.votos / 4)));
        doc.line(leftX + nodeWidth, y1, rightX, y2);
        if (index < 4) {
          doc.setFontSize(6.5);
          doc.setTextColor(82, 92, 108);
          doc.text(String(flow.votos), (leftX + nodeWidth + rightX) / 2, (y1 + y2) / 2 - 1);
        }
      });
      doc.setFontSize(7);
      doc.setTextColor(82, 92, 108);
      doc.text("Origen", leftX, diagramTop + diagramHeight + 8);
      doc.text("Destino", rightX + nodeWidth, diagramTop + diagramHeight + 8, { align: "right" });
      autoTable(doc, {
        startY: diagramTop + diagramHeight + 14,
        head: [["Origen", "Destino", "Votos"]],
        body: sankeyFlows.slice(0, 12).map((flow) => [flow.origen, flow.destino, flow.votos.toLocaleString("es-ES")]),
        theme: "grid",
        margin: { left: 14, right: 14 },
        styles: { font: "helvetica", fontSize: 7.5, cellPadding: 2, textColor: [35, 42, 55] },
        headStyles: { fillColor: [12, 17, 32], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [247, 248, 251] },
        columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 60 }, 2: { cellWidth: 30, halign: "right" } },
      });
      noteY = ((doc as any).lastAutoTable?.finalY ?? extrasY + 80) + 12;
    } else {
      noteY = extrasY;
    }
  }
  if (noteY > availableHeight - 35) {
    doc.addPage();
    noteY = 24;
  }
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

  return doc;
}

export function getElectoralPdfFilename(generatedAt = new Date()) {
  return `resumen-electoral-batalla-cultural-${generatedAt.toISOString().slice(0, 10)}.pdf`;
}

export function createElectoralSummaryPdfBlob(
  parties: ElectoralPdfParty[],
  context: ElectoralPdfContext,
  orientation: ElectoralPdfOrientation = "portrait",
) {
  const doc = buildElectoralSummaryPdf(parties, context, orientation);
  return { blob: doc.output("blob") as Blob, filename: getElectoralPdfFilename(context.generadoEn ?? new Date()) };
}

export function exportElectoralSummaryPdf(
  parties: ElectoralPdfParty[],
  context: ElectoralPdfContext,
  orientation: ElectoralPdfOrientation = "portrait",
) {
  const doc = buildElectoralSummaryPdf(parties, context, orientation);
  const filename = getElectoralPdfFilename(context.generadoEn ?? new Date());
  doc.save(filename);
  return filename;
}
