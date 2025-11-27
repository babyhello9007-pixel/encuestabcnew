import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { supabase } from './supabase';

export interface PartyStats {
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
}

export interface PartyMetricsView {
  partido?: string;
  asociacion?: string;
  edad_promedio: number;
  ideologia_promedio: number;
  total_votos: number;
}

export async function exportPDFWithMetrics(
  stats: PartyStats[],
  activeTab: "general" | "youth",
  totalResponses: number,
  edadPromedio: number | null,
  ideologiaPromedio: number | null
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Obtener métricas por partido desde las vistas
  const metricsPerParty = await getMetricsFromViews(activeTab);

  // Header
  doc.setFillColor(196, 30, 58); // #C41E3A
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const title = activeTab === "general" ? "Resultados - Elecciones Generales" : "Resultados - Asociaciones Juveniles";
  doc.text(title, 15, 22);

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition = 40;

  // Summary section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen General', 15, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const summaryData = [
    ['Total de Respuestas', totalResponses.toString()],
    ['Edad Media General', edadPromedio ? `${edadPromedio.toFixed(1)} años` : 'N/A'],
    ['Ideología Media General', ideologiaPromedio ? `${ideologiaPromedio.toFixed(1)}/10` : 'N/A'],
    ['Fecha de Generación', new Date().toLocaleDateString('es-ES')],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: summaryData,
    headStyles: { fillColor: [196, 30, 58], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [245, 241, 232] },
    margin: { left: 15, right: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Tabla de resultados con métricas por partido
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultados Electorales', 15, yPosition);
  yPosition += 10;

  const tableData = stats.map((party) => {
    const metrics = metricsPerParty[party.nombre] || { edad_promedio: 0, ideologia_promedio: 0 };
    return [
      party.nombre,
      party.votos.toString(),
      `${party.porcentaje.toFixed(2)}%`,
      party.escanos.toString(),
      `${metrics.edad_promedio.toFixed(1)}`,
      `${metrics.ideologia_promedio.toFixed(1)}`,
    ];
  });

  (doc as any).autoTable({
    startY: yPosition,
    head: [['Partido/Asociación', 'Votos', 'Porcentaje', 'Escaños', 'Edad Media', 'Ideología Media']],
    body: tableData,
    headStyles: { fillColor: [196, 30, 58], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [245, 241, 232] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

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

async function getMetricsFromViews(activeTab: "general" | "youth"): Promise<Record<string, PartyMetricsView>> {
  try {
    const viewName = activeTab === "general" 
      ? "edad_ideologia_por_partido" 
      : "edad_ideologia_por_asociacion";

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
  activeTab: "general" | "youth",
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

