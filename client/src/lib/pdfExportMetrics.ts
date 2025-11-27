import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface PartyMetrics {
  name: string;
  votes: number;
  seats: number;
  percentage: number;
  ageAverage: number;
  ideologyAverage: number;
}

export interface PDFExportData {
  title: string;
  totalVotes: number;
  totalSeats: number;
  ageAverage: number;
  ideologyAverage: number;
  executiveNote: number;
  parties: PartyMetrics[];
  associations: PartyMetrics[];
}

export async function exportToPDFWithMetrics(data: PDFExportData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFillColor(196, 30, 58); // #C41E3A
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.title, 15, 22);

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
    ['Total de Respuestas', data.totalVotes.toString()],
    ['Escaños en Juego', data.totalSeats.toString()],
    ['Edad Media', `${data.ageAverage.toFixed(1)} años`],
    ['Posición Ideológica Media', `${data.ideologyAverage.toFixed(1)}/10`],
    ['Nota Ejecutivo', `${data.executiveNote.toFixed(1)}/10`],
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

  // Elecciones Generales
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultados - Elecciones Generales', 15, yPosition);
  yPosition += 10;

  const partiesTableData = data.parties.map((party) => [
    party.name,
    party.votes.toString(),
    party.seats.toString(),
    `${party.percentage.toFixed(1)}%`,
    `${party.ageAverage.toFixed(1)}`,
    `${party.ideologyAverage.toFixed(1)}`,
  ]);

  (doc as any).autoTable({
    startY: yPosition,
    head: [['Partido', 'Votos', 'Escaños', 'Porcentaje', 'Edad Media', 'Ideología Media']],
    body: partiesTableData,
    headStyles: { fillColor: [196, 30, 58], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [245, 241, 232] },
    margin: { left: 15, right: 15 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPosition > pageHeight - 50) {
    doc.addPage();
    yPosition = 20;
  }

  // Asociaciones Juveniles
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultados - Asociaciones Juveniles', 15, yPosition);
  yPosition += 10;

  const associationsTableData = data.associations.map((assoc) => [
    assoc.name,
    assoc.votes.toString(),
    assoc.seats.toString(),
    `${assoc.percentage.toFixed(1)}%`,
    `${assoc.ageAverage.toFixed(1)}`,
    `${assoc.ideologyAverage.toFixed(1)}`,
  ]);

  (doc as any).autoTable({
    startY: yPosition,
    head: [['Asociación', 'Votos', 'Escaños', 'Porcentaje', 'Edad Media', 'Ideología Media']],
    body: associationsTableData,
    headStyles: { fillColor: [196, 30, 58], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 0 },
    alternateRowStyles: { fillColor: [245, 241, 232] },
    margin: { left: 15, right: 15 },
  });

  // Footer
  const totalPages = doc.internal.pages.length;
  for (let i = 1; i < totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${totalPages - 1}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
}

export async function downloadPDFWithMetrics(data: PDFExportData, filename: string = 'encuesta-resultados.pdf') {
  try {
    const doc = await exportToPDFWithMetrics(data);
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

