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
  nombre: string;
  edad_promedio: number;
  ideologia_promedio: number;
  total_votos: number;
}

export async function exportResultsToPDF(
  activeTab: 'general' | 'youth',
  stats: PartyStats[],
  totalEscanos: number,
  edadPromedio: number | null,
  ideologiaPromedio: number | null,
  generalMetrics: PartyMetrics[],
  youthMetrics: PartyMetrics[]
) {
  try {
    const doc = new jsPDF();
    const title = activeTab === 'general' ? 'Resultados - Elecciones Generales' : 'Resultados - Asociaciones Juveniles';
    
    doc.setFontSize(16);
    doc.text(title, 14, 22);
    
    // Tabla principal de resultados
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
      startY: 30,
      theme: 'grid'
    });
    
    // Agregar sección de métricas generales
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.text('Métricas Demográficas Generales', 14, finalY);
    finalY += 8;
    
    const metricsData: string[][] = [];
    if (edadPromedio !== null) {
      metricsData.push(['Edad Media', edadPromedio.toFixed(1) + ' años']);
    }
    if (ideologiaPromedio !== null) {
      metricsData.push(['Ideología Media', ideologiaPromedio.toFixed(1) + '/10']);
    }
    
    if (metricsData.length > 0) {
      (doc as any).autoTable({
        head: [['Métrica', 'Valor']],
        body: metricsData,
        startY: finalY,
        theme: 'grid'
      });
    }
    
    // Agregar métricas por partido si están disponibles
    const metricsToShow = activeTab === 'general' ? generalMetrics : youthMetrics;
    if (metricsToShow.length > 0) {
      finalY = (doc as any).lastAutoTable.finalY + 10;
      
      doc.setFontSize(12);
      doc.text('Métricas por Partido/Asociación', 14, finalY);
      finalY += 8;
      
      const partyMetricsData = metricsToShow.map(metric => [
        metric.nombre,
        metric.edad_promedio.toFixed(1) + ' años',
        metric.ideologia_promedio.toFixed(1) + '/10',
        metric.total_votos.toString()
      ]);
      
      (doc as any).autoTable({
        head: [['Partido/Asociación', 'Edad Media', 'Ideología Media', 'Total Votos']],
        body: partyMetricsData,
        startY: finalY,
        theme: 'grid'
      });
    }
    
    doc.save(`resultados-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (err) {
    console.error('Error exporting to PDF:', err);
    throw err;
  }
}

