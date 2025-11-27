import html2canvas from 'html2canvas';
import { PARTIES_GENERAL, YOUTH_ASSOCIATIONS } from './surveyData';

interface PartyStats {
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
}

export const generateAdvancedInfographic = async (
  stats: PartyStats[],
  activeTab: "general" | "youth",
  totalResponses: number
) => {
  // Crear contenedor temporal
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '1920px';
  container.style.height = '1080px';
  container.style.backgroundColor = '#1A1A1A';
  container.style.padding = '40px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';

  // Header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '30px';
  header.style.borderBottom = '3px solid #C41E3A';
  header.style.paddingBottom = '20px';

  const title = document.createElement('h1');
  title.textContent = 'III Encuesta de Batalla Cultural';
  title.style.color = '#C41E3A';
  title.style.fontSize = '48px';
  title.style.margin = '0 0 10px 0';

  const subtitle = document.createElement('p');
  subtitle.textContent = activeTab === 'general' ? 'Elecciones Generales' : 'Asociaciones Juveniles';
  subtitle.style.color = '#E8E8E8';
  subtitle.style.fontSize = '28px';
  subtitle.style.margin = '0';

  header.appendChild(title);
  header.appendChild(subtitle);

  // Content
  const content = document.createElement('div');
  content.style.display = 'grid';
  content.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
  content.style.gap = '30px';
  content.style.marginBottom = '30px';

  // Agregar tarjetas para cada partido
  stats.slice(0, 6).forEach((party) => {
    const card = document.createElement('div');
    card.style.backgroundColor = '#0F1419';
    card.style.border = '2px solid #C41E3A';
    card.style.borderRadius = '12px';
    card.style.padding = '20px';
    card.style.textAlign = 'center';

    // Logo
    const logo = document.createElement('img');
    logo.src = party.logo;
    logo.style.width = '80px';
    logo.style.height = '80px';
    logo.style.objectFit = 'contain';
    logo.style.marginBottom = '15px';

    // Nombre
    const name = document.createElement('h3');
    name.textContent = party.nombre;
    name.style.color = '#E8E8E8';
    name.style.fontSize = '18px';
    name.style.margin = '0 0 10px 0';

    // Porcentaje
    const percentage = document.createElement('p');
    percentage.textContent = `${party.porcentaje.toFixed(1)}%`;
    percentage.style.color = '#C41E3A';
    percentage.style.fontSize = '32px';
    percentage.style.fontWeight = 'bold';
    percentage.style.margin = '0 0 10px 0';

    // Escaños
    const seats = document.createElement('p');
    seats.textContent = `${party.escanos} escaños`;
    seats.style.color = '#999999';
    seats.style.fontSize = '14px';
    seats.style.margin = '0';

    card.appendChild(logo);
    card.appendChild(name);
    card.appendChild(percentage);
    card.appendChild(seats);

    content.appendChild(card);
  });

  // Footer
  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.style.borderTop = '2px solid #C41E3A';
  footer.style.paddingTop = '20px';
  footer.style.color = '#999999';
  footer.style.fontSize = '14px';

  const leftFooter = document.createElement('span');
  leftFooter.textContent = `Total de respuestas: ${totalResponses}`;

  const rightFooter = document.createElement('span');
  rightFooter.textContent = new Date().toLocaleDateString('es-ES');

  footer.appendChild(leftFooter);
  footer.appendChild(rightFooter);

  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(footer);

  document.body.appendChild(container);

  try {
    // Generar canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#1A1A1A',
      logging: false,
    });

    // Convertir a imagen
    const image = canvas.toDataURL('image/png');

    // Descargar
    const link = document.createElement('a');
    link.href = image;
    link.download = `infografia-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
    link.click();

    return image;
  } finally {
    document.body.removeChild(container);
  }
};

export const generateAllLogosInfographic = async (
  activeTab: "general" | "youth",
  totalResponses: number
) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '1920px';
  container.style.height = '1080px';
  container.style.backgroundColor = '#1A1A1A';
  container.style.padding = '40px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';

  // Header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '30px';
  header.style.borderBottom = '3px solid #C41E3A';
  header.style.paddingBottom = '20px';

  const title = document.createElement('h1');
  title.textContent = 'III Encuesta de Batalla Cultural';
  title.style.color = '#C41E3A';
  title.style.fontSize = '48px';
  title.style.margin = '0 0 10px 0';

  const subtitle = document.createElement('p');
  subtitle.textContent = activeTab === 'general' ? 'Todos los Partidos' : 'Todas las Asociaciones';
  subtitle.style.color = '#E8E8E8';
  subtitle.style.fontSize = '28px';
  subtitle.style.margin = '0';

  header.appendChild(title);
  header.appendChild(subtitle);

  // Content - Grid de logos
  const content = document.createElement('div');
  content.style.display = 'grid';
  content.style.gridTemplateColumns = 'repeat(8, 1fr)';
  content.style.gap = '20px';
  content.style.marginBottom = '30px';
  content.style.alignItems = 'center';
  content.style.justifyItems = 'center';

  const parties = activeTab === 'general' ? PARTIES_GENERAL : YOUTH_ASSOCIATIONS;

  Object.entries(parties).forEach(([key, party]) => {
    const logoContainer = document.createElement('div');
    logoContainer.style.width = '100px';
    logoContainer.style.height = '100px';
    logoContainer.style.display = 'flex';
    logoContainer.style.alignItems = 'center';
    logoContainer.style.justifyContent = 'center';
    logoContainer.style.backgroundColor = '#0F1419';
    logoContainer.style.borderRadius = '8px';
    logoContainer.style.border = '1px solid #333333';

    const logo = document.createElement('img');
    logo.src = party.logo;
    logo.style.width = '80px';
    logo.style.height = '80px';
    logo.style.objectFit = 'contain';

    logoContainer.appendChild(logo);
    content.appendChild(logoContainer);
  });

  // Footer
  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.style.borderTop = '2px solid #C41E3A';
  footer.style.paddingTop = '20px';
  footer.style.color = '#999999';
  footer.style.fontSize = '14px';

  const leftFooter = document.createElement('span');
  leftFooter.textContent = `Total de respuestas: ${totalResponses}`;

  const rightFooter = document.createElement('span');
  rightFooter.textContent = new Date().toLocaleDateString('es-ES');

  footer.appendChild(leftFooter);
  footer.appendChild(rightFooter);

  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(footer);

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#1A1A1A',
      logging: false,
    });

    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = `logos-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
    link.click();

    return image;
  } finally {
    document.body.removeChild(container);
  }
};

