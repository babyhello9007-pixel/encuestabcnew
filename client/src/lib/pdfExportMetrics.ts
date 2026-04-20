import { jsPDF } from 'jspdf';
import { supabase } from './supabase';

export interface PartyStats {
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
  color?: string;
}

export interface PartyMetricsView {
  partido?: string;
  asociacion?: string;
  edad_promedio: number;
  ideologia_promedio: number;
  total_votos: number;
}

const COLUMN_WIDTH = 30;
const ROW_HEIGHT = 8;
const MARGIN_LEFT = 15;
const MARGIN_RIGHT = 15;

async function toDataUrl(url: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  try {
    const response = await fetch(url);
    if (!response.ok) return '';
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

function drawTable(
  doc: jsPDF,
  startY: number,
  headers: string[],
  rows: string[][],
  columnWidths?: number[]
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const availableWidth = pageWidth - margin * 2;

  // Default column widths
  if (!columnWidths) {
    columnWidths = headers.map(() => availableWidth / headers.length);
  }

  let yPos = startY;
  const headerHeight = 8;
  const cellPadding = 2;

  // Draw header
  doc.setFillColor(196, 30, 58);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  let xPos = margin;
  // Dibujar fondo rojo para todo el encabezado
  doc.setFillColor(196, 30, 58);
  doc.rect(margin, yPos, availableWidth, headerHeight, 'F');
  
  // Dibujar bordes de cada columna
  doc.setDrawColor(196, 30, 58);
  xPos = margin;
  headers.forEach((header, i) => {
    doc.rect(xPos, yPos, columnWidths![i], headerHeight);
    xPos += columnWidths![i];
  });
  
  // Dibujar texto
  xPos = margin;
  headers.forEach((header, i) => {
    // Alinear texto al centro verticalmente
    doc.text(header, xPos + columnWidths![i] / 2, yPos + 5, {
      align: 'center',
      maxWidth: columnWidths![i] - cellPadding * 2,
    });
    xPos += columnWidths![i];
  });

  yPos += headerHeight;

  // Draw rows
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  rows.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (yPos + ROW_HEIGHT > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }

    // Alternate row colors
    if (rowIndex % 2 === 1) {
      doc.setFillColor(245, 241, 232);
      xPos = margin;
      headers.forEach((_, i) => {
        doc.rect(xPos, yPos, columnWidths![i], ROW_HEIGHT, 'F');
        xPos += columnWidths![i];
      });
    }

    xPos = margin;
    row.forEach((cell, i) => {
      // Dibujar borde de la celda
      doc.setDrawColor(200, 200, 200);
      doc.rect(xPos, yPos, columnWidths![i], ROW_HEIGHT);
      // Alinear números a la derecha, texto a la izquierda
      const isNumeric = !isNaN(Number(cell.replace('%', '').replace('años', '')));
      const align = isNumeric && i > 0 ? 'right' : 'left';
      const xOffset = align === 'right' ? columnWidths![i] - cellPadding : cellPadding;
      doc.text(cell, xPos + xOffset, yPos + ROW_HEIGHT / 2 + 1, {
        align: align as any,
        maxWidth: columnWidths![i] - cellPadding * 2,
      });
      xPos += columnWidths![i];
    });

    yPos += ROW_HEIGHT;
  });

  return yPos;
}

export async function exportPDFWithMetrics(
  stats: PartyStats[],
  activeTab: "general" | "youth" | "leaders" | "metrics" | "tendencias" | "lideres-preferidos" | "ccaa" | "provincias" | "comparacion-ccaa" | "mapa-hemiciclo" | "asoc-juv-mapa-hemiciclo" | "el-analisis" | "encuestadoras-externas" | "preguntas-varias" | "lideres-partidos" | "simulador-electoral",
  totalResponses: number,
  edadPromedio: number | null,
  ideologiaPromedio: number | null
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Obtener métricas por partido desde las vistas
  let metricsPerParty: Record<string, PartyMetricsView> = {};
  if (activeTab === "general" || activeTab === "youth" || activeTab === "asoc-juv-mapa-hemiciclo") {
    metricsPerParty = await getMetricsFromViews(activeTab as any);
  }

  // Header
  doc.setFillColor(196, 30, 58);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setFillColor(139, 21, 40);
  doc.rect(0, 22, pageWidth, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const title = activeTab === "general" ? "Resultados · Elecciones Generales" : "Resultados · Asociaciones Juveniles";
  doc.text(title, 15, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Batalla Cultural · Informe automático', 15, 26.5);

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition = 40;

  // Summary section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen General', 15, yPosition);
  yPosition += 10;

  const summaryHeaders = ['Métrica', 'Valor'];
  const summaryData = [
    ['Total de Respuestas', totalResponses.toString()],
    ['Edad Media General', edadPromedio ? `${edadPromedio.toFixed(1)} años` : 'N/A'],
    ['Ideología Media General', ideologiaPromedio ? `${ideologiaPromedio.toFixed(1)}/10` : 'N/A'],
    ['Fecha de Generación', new Date().toLocaleDateString('es-ES')],
  ];

  yPosition = drawTable(doc, yPosition, summaryHeaders, summaryData, [50, 80]) + 15;

  // Top partidos (mejora visual con color/logo)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top Partidos / Asociaciones', 15, yPosition);
  yPosition += 8;

  const topParties = [...stats].sort((a, b) => b.votos - a.votos).slice(0, 5);
  const cardWidth = (pageWidth - 30 - 8) / 2;
  const cardHeight = 24;
  for (let i = 0; i < topParties.length; i++) {
    if (yPosition + cardHeight > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }
    const party = topParties[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 15 + col * (cardWidth + 8);
    const y = yPosition + row * (cardHeight + 4);

    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

    const hex = (party.color || '#9CA3AF').replace('#', '');
    const rgb = hex.length === 6 ? [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16),
    ] : [156, 163, 175];
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(x, y, 4, cardHeight, 'F');

    const logoData = await toDataUrl(party.logo || '');
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', x + 6, y + 4, 8, 8);
      } catch {
        // Ignore logo drawing failures
      }
    }

    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(party.nombre.substring(0, 28), x + 16, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${party.votos.toLocaleString()} votos · ${party.porcentaje.toFixed(1)}%`, x + 16, y + 13);
    doc.text(`${party.escanos} escaños · ${(party.color || '#9CA3AF').toUpperCase()}`, x + 16, y + 18);
  }
  yPosition += Math.ceil(topParties.length / 2) * (cardHeight + 4) + 8;

  // Tabla de resultados con métricas por partido
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultados Electorales', 15, yPosition);
  yPosition += 10;

  const tableHeaders = ['Partido/Asociación', 'Color', 'Votos', 'Porcentaje', 'Escaños', 'Edad Media', 'Ideología Media'];
  const tableData = stats.map((party) => {
    const metrics = metricsPerParty[party.nombre] || { edad_promedio: 0, ideologia_promedio: 0 };
    return [
      party.nombre,
      (party.color || '#C41E3A').toUpperCase(),
      party.votos.toString(),
      `${party.porcentaje.toFixed(2)}%`,
      party.escanos.toString(),
      `${metrics.edad_promedio.toFixed(1)}`,
      `${metrics.ideologia_promedio.toFixed(1)}`,
    ];
  });

  yPosition = drawTable(doc, yPosition, tableHeaders, tableData, [34, 24, 18, 18, 18, 24, 24]) + 20;

  // Check if we need a new page
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = 20;
  }

  // Metodología
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Metodología', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);

  const methodologyText = activeTab === "general"
    ? "Elecciones Generales: 350 escaños distribuidos mediante la Ley d'Hondt con un umbral mínimo del 3% de los votos válidos. Las métricas de edad e ideología se calculan a partir de los datos demográficos de los votantes de cada partido."
    : "Asociaciones Juveniles: 50 escaños distribuidos mediante la Ley d'Hondt con un umbral mínimo del 7% de los votos válidos. Las métricas de edad e ideología se calculan a partir de los datos demográficos de los votantes de cada asociación.";

  const wrappedText = doc.splitTextToSize(methodologyText, pageWidth - 30);
  doc.text(wrappedText, 15, yPosition);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const totalPages = doc.internal.pages.length;
  for (let i = 1; i < totalPages; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${totalPages - 1}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
}

async function getMetricsFromViews(activeTab: "general" | "youth" | "asoc-juv-mapa-hemiciclo"): Promise<Record<string, PartyMetricsView>> {
  try {
    const viewName = activeTab === "general" 
      ? "edad_ideologia_por_partido" 
      : activeTab === "youth" || activeTab === "asoc-juv-mapa-hemiciclo"
      ? "edad_ideologia_por_asociacion"
      : "edad_ideologia_por_partido";

    const { data, error } = await supabase
      .from(viewName)
      .select("*");

    if (error) {
      console.error(`Error fetching from ${viewName}:`, error);
      return {};
    }

    if (!data || data.length === 0) {
      return {};
    }

    const result: Record<string, PartyMetricsView> = {};

    data.forEach((row: any) => {
      const key = activeTab === "general" ? row.partido : row.asociacion;
      result[key] = {
        edad_promedio: row.edad_promedio || 0,
        ideologia_promedio: row.ideologia_promedio || 0,
        total_votos: row.total_votos || 0,
      };
    });

    return result;
  } catch (error) {
    console.error("Error getting metrics from views:", error);
    return {};
  }
}

export async function downloadPDFWithMetrics(
  stats: PartyStats[],
  activeTab: "general" | "youth" | "leaders" | "metrics" | "tendencias" | "lideres-preferidos" | "ccaa" | "provincias" | "comparacion-ccaa" | "mapa-hemiciclo" | "asoc-juv-mapa-hemiciclo" | "el-analisis" | "encuestadoras-externas" | "preguntas-varias" | "lideres-partidos" | "simulador-electoral",
  totalResponses: number,
  edadPromedio: number | null,
  ideologiaPromedio: number | null
) {
  try {
    const doc = await exportPDFWithMetrics(stats, activeTab, totalResponses, edadPromedio, ideologiaPromedio);
    doc.save(`resultados-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
