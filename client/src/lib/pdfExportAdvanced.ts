import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PartyStats {
  id: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
}

interface PartyMetrics {
  partido: string;
  edad_promedio: number;
  ideologia_promedio: number;
  total_votos: number;
}

export async function exportResultsToPDFAdvanced(
  activeTab: 'general' | 'youth',
  stats: PartyStats[],
  totalEscanos: number,
  edadPromedio: number | null,
  ideologiaPromedio: number | null,
  metricsData: PartyMetrics[]
) {
  try {
    const doc = new jsPDF();
    const title = activeTab === 'general' 
      ? 'Resultados - Elecciones Generales' 
      : 'Resultados - Asociaciones Juveniles';
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(196, 30, 58); // Color rojo #C41E3A
    doc.text(title, 14, 20);
    
    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 28);
    
    // Tabla principal de resultados
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Resultados Electorales', 14, 38);
    
    const tableData = stats.map(party => [
      party.nombre,
      party.votos.toString(),
      party.porcentaje.toFixed(2) + '%',
      party.escanos.toString(),
      ((party.escanos / totalEscanos) * 100).toFixed(2) + '%'
    ]);
    
    (doc as any).autoTable({
      head: [['Partido/Asociación', 'Votos', 'Porcentaje', 'Escaños', '% Escaños']],
      body: tableData,
      startY: 42,
      theme: 'grid',
      headStyles: {
        fillColor: [196, 30, 58],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Sección de métricas generales
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setTextColor(196, 30, 58);
    doc.text('Métricas Demográficas Generales', 14, finalY);
    finalY += 8;
    
    const metricsGeneralData: string[][] = [];
    if (edadPromedio !== null) {
      metricsGeneralData.push(['Edad Media', edadPromedio.toFixed(1) + ' años']);
    }
    if (ideologiaPromedio !== null) {
      metricsGeneralData.push(['Ideología Media', ideologiaPromedio.toFixed(1) + '/10']);
    }
    metricsGeneralData.push(['Total de Respuestas', stats.reduce((sum, s) => sum + s.votos, 0).toString()]);
    
    if (metricsGeneralData.length > 0) {
      (doc as any).autoTable({
        head: [['Métrica', 'Valor']],
        body: metricsGeneralData,
        startY: finalY,
        theme: 'grid',
        headStyles: {
          fillColor: [196, 30, 58],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        }
      });
    }
    
    // Sección de métricas por partido
    finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setTextColor(196, 30, 58);
    doc.text('Métricas por Partido/Asociación', 14, finalY);
    finalY += 8;
    
    if (metricsData.length > 0) {
      const partyMetricsData = metricsData.map(metric => [
        metric.partido,
        metric.edad_promedio.toFixed(1) + ' años',
        metric.ideologia_promedio.toFixed(1) + '/10',
        metric.total_votos.toString()
      ]);
      
      (doc as any).autoTable({
        head: [['Partido/Asociación', 'Edad Media', 'Ideología Media', 'Total Votos']],
        body: partyMetricsData,
        startY: finalY,
        theme: 'grid',
        headStyles: {
          fillColor: [196, 30, 58],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
    }
    
    // Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'La Encuesta de Batalla Cultural © 2025',
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    doc.save(`resultados-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error('Error exporting to PDF:', err);
    throw err;
  }
}

