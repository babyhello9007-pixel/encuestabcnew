import html2canvas from 'html2canvas';
import { PARTIES_GENERAL, ASSOCIATIONS_YOUTH } from './surveyData';

export interface InfographicData {
  title: string;
  totalVotes: number;
  totalSeats: number;
  results: Array<{
    name: string;
    votes: number;
    seats: number;
    percentage: number;
    logo?: string;
  }>;
  metrics: {
    ageAverage: number;
    ideologyAverage: number;
    executiveNote: number;
  };
}

export async function generateInfographicPNG(data: InfographicData): Promise<Blob> {
  const container = document.createElement('div');
  container.style.width = '1920px';
  container.style.height = '1080px';
  container.style.backgroundColor = '#1a1a1a';
  container.style.padding = '40px';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.color = '#ffffff';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';

  // Header
  const header = document.createElement('div');
  header.style.marginBottom = '30px';
  header.innerHTML = `
    <h1 style="font-size: 48px; font-weight: bold; margin: 0; color: #C41E3A;">${data.title}</h1>
    <p style="font-size: 18px; color: #999999; margin: 10px 0 0 0;">La Encuesta de Batalla Cultural</p>
  `;
  container.appendChild(header);

  // Main content
  const mainContent = document.createElement('div');
  mainContent.style.display = 'grid';
  mainContent.style.gridTemplateColumns = '1fr 1fr';
  mainContent.style.gap = '40px';
  mainContent.style.marginBottom = '30px';
  mainContent.style.flex = '1';

  // Left side - Results
  const leftSide = document.createElement('div');
  leftSide.style.display = 'flex';
  leftSide.style.flexDirection = 'column';
  leftSide.style.gap = '15px';

  data.results.slice(0, 6).forEach((result) => {
    const resultItem = document.createElement('div');
    resultItem.style.display = 'flex';
    resultItem.style.alignItems = 'center';
    resultItem.style.gap = '15px';
    resultItem.style.padding = '12px';
    resultItem.style.backgroundColor = '#2a2a2a';
    resultItem.style.borderRadius = '8px';

    const logo = document.createElement('img');
    logo.src = result.logo || '';
    logo.style.width = '40px';
    logo.style.height = '40px';
    logo.style.borderRadius = '4px';
    logo.style.objectFit = 'contain';

    const info = document.createElement('div');
    info.style.flex = '1';
    info.innerHTML = `
      <div style="font-weight: 600; font-size: 16px;">${result.name}</div>
      <div style="font-size: 14px; color: #999999;">${result.votes} votos (${result.percentage.toFixed(1)}%)</div>
    `;

    const seats = document.createElement('div');
    seats.style.fontSize = '20px';
    seats.style.fontWeight = 'bold';
    seats.style.color = '#C41E3A';
    seats.textContent = `${result.seats} escaños`;

    resultItem.appendChild(logo);
    resultItem.appendChild(info);
    resultItem.appendChild(seats);
    leftSide.appendChild(resultItem);
  });

  mainContent.appendChild(leftSide);

  // Right side - Metrics
  const rightSide = document.createElement('div');
  rightSide.style.display = 'flex';
  rightSide.style.flexDirection = 'column';
  rightSide.style.gap = '15px';

  const metrics = [
    { label: 'Total de Votos', value: data.totalVotes.toString() },
    { label: 'Escaños en Juego', value: data.totalSeats.toString() },
    { label: 'Edad Media', value: `${data.metrics.ageAverage.toFixed(1)} años` },
    { label: 'Ideología Media', value: `${data.metrics.ideologyAverage.toFixed(1)}/10` },
    { label: 'Nota Ejecutivo', value: `${data.metrics.executiveNote.toFixed(1)}/10` },
  ];

  metrics.forEach((metric) => {
    const metricItem = document.createElement('div');
    metricItem.style.padding = '15px';
    metricItem.style.backgroundColor = '#2a2a2a';
    metricItem.style.borderRadius = '8px';
    metricItem.style.borderLeft = '4px solid #C41E3A';

    metricItem.innerHTML = `
      <div style="font-size: 14px; color: #999999;">${metric.label}</div>
      <div style="font-size: 28px; font-weight: bold; color: #C41E3A; margin-top: 5px;">${metric.value}</div>
    `;

    rightSide.appendChild(metricItem);
  });

  mainContent.appendChild(rightSide);
  container.appendChild(mainContent);

  // Footer
  const footer = document.createElement('div');
  footer.style.textAlign = 'center';
  footer.style.fontSize = '14px';
  footer.style.color = '#666666';
  footer.style.borderTop = '1px solid #333333';
  footer.style.paddingTop = '20px';
  footer.innerHTML = `
    <p style="margin: 0;">La Encuesta de Batalla Cultural © 2025 | Análisis político, juventud y futuro de España</p>
  `;
  container.appendChild(footer);

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#1a1a1a',
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });

    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

export async function downloadInfographicPNG(data: InfographicData, filename: string = 'encuesta-resultados.png') {
  try {
    const blob = await generateInfographicPNG(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  }
}

