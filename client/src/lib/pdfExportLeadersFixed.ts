import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { supabase } from '@/lib/supabase';

interface LeaderResult {
  partido: string;
  lider_preferido: string;
  total_votos: number;
  porcentaje: number;
}

export async function exportLeadersToPDFFixed(selectedParty: string | null) {
  if (!selectedParty) {
    console.warn('No party selected');
    return;
  }

  try {
    // Fetch raw data from lideres_preferidos table
    const { data, error } = await supabase
      .from('lideres_preferidos')
      .select('partido, lider_preferido')
      .eq('partido', selectedParty);

    if (error) {
      console.error('Error fetching leaders data:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.warn('No data available for party:', selectedParty);
      return;
    }

    // Process data to get counts and percentages
    const leaderCounts: { [key: string]: number } = {};
    data.forEach((item: any) => {
      leaderCounts[item.lider_preferido] = (leaderCounts[item.lider_preferido] || 0) + 1;
    });

    const totalVotes = data.length;
    const leaders: LeaderResult[] = Object.entries(leaderCounts)
      .map(([name, count]) => ({
        partido: selectedParty,
        lider_preferido: name,
        total_votos: count as number,
        porcentaje: Math.round((count as number / totalVotes) * 100 * 100) / 100,
      }))
      .sort((a, b) => b.total_votos - a.total_votos);

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(24);
    doc.setTextColor(196, 30, 58); // #C41E3A
    doc.text('La Encuesta de Batalla Cultural', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(16);
    doc.setTextColor(45, 45, 45); // #2D2D2D
    doc.text('Resultados: ¿Quién quieres que sea el líder de tu partido?', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102); // #666666
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;

    // Note about independence
    doc.setFontSize(9);
    doc.setTextColor(0, 102, 204); // Blue
    const noteText = 'Nota: Estos resultados son independientes a los de "La Encuesta de Batalla Cultural".';
    doc.text(noteText, 15, yPosition);
    yPosition += 12;

    // Party title
    doc.setFontSize(14);
    doc.setTextColor(196, 30, 58); // #C41E3A
    doc.text(`${selectedParty}`, 15, yPosition);
    yPosition += 10;

    // Create table data
    const tableData = leaders.map((leader, index) => [
      String(index + 1),
      leader.lider_preferido,
      String(leader.total_votos),
      `${leader.porcentaje}%`,
    ]);

    // Add table
    (doc as any).autoTable({
      head: [['Posición', 'Líder', 'Votos', 'Porcentaje']],
      body: tableData,
      startY: yPosition,
      margin: { left: 15, right: 15 },
      headStyles: {
        fillColor: [196, 30, 58],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      bodyStyles: {
        textColor: [45, 45, 45],
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 241, 232],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'left' },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 25 },
      },
    });

    // Footer
    const totalPages = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(153, 153, 153); // #999999
      doc.text(
        `La Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos | Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`resultados-lideres-${selectedParty}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error('Error exporting to PDF:', err);
  }
}

