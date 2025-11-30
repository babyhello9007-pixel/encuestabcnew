import jsPDF from 'jspdf';
import { supabase } from '@/lib/supabase';

interface LeaderResult {
  partido: string;
  lider_preferido: string;
  total_votos: number;
  porcentaje: number;
}

export async function exportLeadersToPDFV4(selectedParty: string | null) {
  if (!selectedParty) {
    console.warn('No party selected');
    return;
  }

  try {
    console.log('Fetching data for party:', selectedParty);
    
    // Fetch data from the ranking_lideres_por_partido view
    const { data, error } = await supabase
      .from('ranking_lideres_por_partido')
      .select('*')
      .eq('partido', selectedParty);

    if (error) {
      console.error('Error fetching leaders data:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.warn('No data available for party:', selectedParty);
      return;
    }

    console.log('Data received:', data);

    const leaders: LeaderResult[] = data as LeaderResult[];

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

    yPosition += 20;

    // Party title
    doc.setFontSize(14);
    doc.setTextColor(196, 30, 58); // #C41E3A
    doc.text(`${selectedParty}`, 15, yPosition);
    yPosition += 12;

    // Table headers
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(196, 30, 58);
    
    const colWidths = [15, 80, 30, 30];
    const headers = ['Pos.', 'Líder', 'Votos', '%'];
    let xPosition = 15;
    
    headers.forEach((header, i) => {
      doc.rect(xPosition, yPosition - 7, colWidths[i], 8, 'F');
      doc.text(header, xPosition + colWidths[i] / 2, yPosition, { align: 'center' });
      xPosition += colWidths[i];
    });

    yPosition += 12;

    // Table rows
    doc.setFontSize(9);
    doc.setTextColor(45, 45, 45);
    
    leaders.forEach((leader, index) => {
      // Alternate row colors
      if (index % 2 === 1) {
        doc.setFillColor(245, 241, 232);
        doc.rect(15, yPosition - 6, pageWidth - 30, 8, 'F');
      }

      xPosition = 15;
      
      // Position
      doc.text(String(index + 1), xPosition + colWidths[0] / 2, yPosition, { align: 'center' });
      xPosition += colWidths[0];
      
      // Leader name
      doc.text(leader.lider_preferido.substring(0, 30), xPosition + 2, yPosition);
      xPosition += colWidths[1];
      
      // Votes
      doc.text(String(leader.total_votos), xPosition + colWidths[2] / 2, yPosition, { align: 'center' });
      xPosition += colWidths[2];
      
      // Percentage
      doc.text(`${leader.porcentaje}%`, xPosition + colWidths[3] / 2, yPosition, { align: 'center' });

      yPosition += 8;

      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(153, 153, 153);
    doc.text(
      'La Encuesta de Batalla Cultural © 2025 | Todos los datos son anónimos y públicos',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Save PDF
    doc.save(`resultados-lideres-${selectedParty}-${new Date().toISOString().split('T')[0]}.pdf`);
    console.log('PDF saved successfully');
  } catch (err) {
    console.error('Error exporting to PDF:', err);
  }
}

