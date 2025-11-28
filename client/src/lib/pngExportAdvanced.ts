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
  totalResponses: number,
  edadPromedio?: number | null,
  ideologiaPromedio?: number | null
) => {
  // Crear contenedor temporal
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '1200px';
  container.style.backgroundColor = 'linear-gradient(to br, #1A1A1A via #0F0F0F to #1A1A1A)';
  container.style.padding = '60px';
  container.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';
  container.style.minHeight = '100vh';
  container.style.color = '#E8E8E8';

  // Header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '50px';
  header.style.borderBottom = '3px solid #C41E3A';
  header.style.paddingBottom = '30px';

  const logoContainer = document.createElement('div');
  logoContainer.style.marginBottom = '20px';
  const logoImg = document.createElement('img');
  logoImg.src = '/favicon.png';
  logoImg.style.width = '60px';
  logoImg.style.height = '60px';
  logoContainer.appendChild(logoImg);

  const title = document.createElement('h1');
  title.textContent = 'La Encuesta de Batalla Cultural';
  title.style.color = '#C41E3A';
  title.style.fontSize = '56px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0 0 15px 0';
  title.style.letterSpacing = '1px';

  const subtitle = document.createElement('p');
  subtitle.textContent = activeTab === 'general' ? 'Resultados - Elecciones Generales' : 'Resultados - Asociaciones Juveniles';
  subtitle.style.color = '#A0A0A0';
  subtitle.style.fontSize = '24px';
  subtitle.style.margin = '0';
  subtitle.style.fontWeight = '300';

  header.appendChild(logoContainer);
  header.appendChild(title);
  header.appendChild(subtitle);

  // Stats row
  const statsRow = document.createElement('div');
  statsRow.style.display = 'grid';
  statsRow.style.gridTemplateColumns = 'repeat(3, 1fr)';
  statsRow.style.gap = '30px';
  statsRow.style.marginBottom = '50px';

  const createStatBox = (label: string, value: string) => {
    const box = document.createElement('div');
    box.style.backgroundColor = 'rgba(15, 20, 25, 0.8)';
    box.style.border = '1px solid #333333';
    box.style.borderRadius = '12px';
    box.style.padding = '25px';
    box.style.textAlign = 'center';

    const labelEl = document.createElement('p');
    labelEl.textContent = label;
    labelEl.style.color = '#999999';
    labelEl.style.fontSize = '14px';
    labelEl.style.margin = '0 0 10px 0';
    labelEl.style.textTransform = 'uppercase';
    labelEl.style.letterSpacing = '1px';

    const valueEl = document.createElement('p');
    valueEl.textContent = value;
    valueEl.style.color = '#C41E3A';
    valueEl.style.fontSize = '36px';
    valueEl.style.fontWeight = 'bold';
    valueEl.style.margin = '0';

    box.appendChild(labelEl);
    box.appendChild(valueEl);
    return box;
  };

  statsRow.appendChild(createStatBox('Total de Respuestas', totalResponses.toLocaleString()));
  statsRow.appendChild(createStatBox('Edad Media', edadPromedio ? edadPromedio.toFixed(1) : 'N/A'));
  statsRow.appendChild(createStatBox('Escaños en Juego', activeTab === 'general' ? '350' : '50'));

  // Content - Tarjetas de partidos
  const content = document.createElement('div');
  content.style.display = 'grid';
  content.style.gridTemplateColumns = 'repeat(2, 1fr)';
  content.style.gap = '25px';
  content.style.marginBottom = '50px';

  // Agregar tarjetas para cada partido
  stats.slice(0, 6).forEach((party) => {
    const card = document.createElement('div');
    card.style.backgroundColor = 'rgba(15, 20, 25, 0.9)';
    card.style.border = '2px solid #C41E3A';
    card.style.borderRadius = '16px';
    card.style.padding = '30px';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = '25px';

    // Logo
    const logoSection = document.createElement('div');
    logoSection.style.flexShrink = '0';
    const logo = document.createElement('img');
    logo.src = party.logo;
    logo.style.width = '100px';
    logo.style.height = '100px';
    logo.style.objectFit = 'contain';
    logo.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    logo.style.borderRadius = '12px';
    logo.style.padding = '10px';
    logoSection.appendChild(logo);

    // Info
    const info = document.createElement('div');
    info.style.flex = '1';

    const name = document.createElement('h3');
    name.textContent = party.nombre;
    name.style.color = '#E8E8E8';
    name.style.fontSize = '22px';
    name.style.fontWeight = 'bold';
    name.style.margin = '0 0 15px 0';

    const stats = document.createElement('div');
    stats.style.display = 'grid';
    stats.style.gridTemplateColumns = 'repeat(3, 1fr)';
    stats.style.gap = '20px';

    const createStat = (label: string, value: string, color: string) => {
      const stat = document.createElement('div');
      stat.style.textAlign = 'center';
      const l = document.createElement('p');
      l.textContent = label;
      l.style.color = '#999999';
      l.style.fontSize = '12px';
      l.style.margin = '0 0 5px 0';
      const v = document.createElement('p');
      v.textContent = value;
      v.style.color = color;
      v.style.fontSize = '20px';
      v.style.fontWeight = 'bold';
      v.style.margin = '0';
      stat.appendChild(l);
      stat.appendChild(v);
      return stat;
    };

    stats.appendChild(createStat('Votos', party.votos.toLocaleString(), '#C41E3A'));
    stats.appendChild(createStat('Porcentaje', `${party.porcentaje.toFixed(1)}%`, '#00AA00'));
    stats.appendChild(createStat('Escaños', party.escanos.toString(), '#0066CC'));

    info.appendChild(name);
    info.appendChild(stats);

    card.appendChild(logoSection);
    card.appendChild(info);
    content.appendChild(card);
  });

  // Footer
  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.style.borderTop = '2px solid #333333';
  footer.style.paddingTop = '30px';
  footer.style.color = '#999999';
  footer.style.fontSize = '13px';

  const leftFooter = document.createElement('span');
  leftFooter.textContent = 'La Encuesta de Batalla Cultural © 2025';

  const rightFooter = document.createElement('span');
  rightFooter.textContent = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  footer.appendChild(leftFooter);
  footer.appendChild(rightFooter);

  container.appendChild(header);
  container.appendChild(statsRow);
  container.appendChild(content);
  container.appendChild(footer);

  document.body.appendChild(container);

  try {
    // Generar canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#1A1A1A',
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Convertir a imagen
    const image = canvas.toDataURL('image/png');

    // Descargar
    const link = document.createElement('a');
    link.href = image;
    link.download = `resultados-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
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
  container.style.width = '1400px';
  container.style.backgroundColor = 'linear-gradient(to br, #1A1A1A via #0F0F0F to #1A1A1A)';
  container.style.padding = '60px';
  container.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';
  container.style.minHeight = '100vh';

  // Header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '50px';
  header.style.borderBottom = '3px solid #C41E3A';
  header.style.paddingBottom = '30px';

  const logoContainer = document.createElement('div');
  logoContainer.style.marginBottom = '20px';
  const logoImg = document.createElement('img');
  logoImg.src = '/favicon.png';
  logoImg.style.width = '60px';
  logoImg.style.height = '60px';
  logoContainer.appendChild(logoImg);

  const title = document.createElement('h1');
  title.textContent = 'La Encuesta de Batalla Cultural';
  title.style.color = '#C41E3A';
  title.style.fontSize = '56px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0 0 15px 0';
  title.style.letterSpacing = '1px';

  const subtitle = document.createElement('p');
  subtitle.textContent = activeTab === 'general' ? 'Todos los Partidos Políticos' : 'Todas las Asociaciones Juveniles';
  subtitle.style.color = '#A0A0A0';
  subtitle.style.fontSize = '24px';
  subtitle.style.margin = '0';
  subtitle.style.fontWeight = '300';

  header.appendChild(logoContainer);
  header.appendChild(title);
  header.appendChild(subtitle);

  // Content - Grid de logos con nombres
  const content = document.createElement('div');
  content.style.display = 'grid';
  content.style.gridTemplateColumns = 'repeat(6, 1fr)';
  content.style.gap = '25px';
  content.style.marginBottom = '50px';

  const parties = activeTab === 'general' ? PARTIES_GENERAL : YOUTH_ASSOCIATIONS;

  Object.entries(parties).forEach(([key, partyData]) => {
    const logoContainer = document.createElement('div');
    logoContainer.style.display = 'flex';
    logoContainer.style.flexDirection = 'column';
    logoContainer.style.alignItems = 'center';
    logoContainer.style.gap = '15px';

    const imgContainer = document.createElement('div');
    imgContainer.style.width = '120px';
    imgContainer.style.height = '120px';
    imgContainer.style.display = 'flex';
    imgContainer.style.alignItems = 'center';
    imgContainer.style.justifyContent = 'center';
    imgContainer.style.backgroundColor = 'rgba(15, 20, 25, 0.9)';
    imgContainer.style.borderRadius = '12px';
    imgContainer.style.border = '2px solid #333333';
    imgContainer.style.padding = '10px';

    const logo = document.createElement('img');
    logo.src = partyData.logo;
    logo.style.width = '100px';
    logo.style.height = '100px';
    logo.style.objectFit = 'contain';

    const name = document.createElement('p');
    name.textContent = partyData.name;
    name.style.color = '#E8E8E8';
    name.style.fontSize = '13px';
    name.style.textAlign = 'center';
    name.style.margin = '0';
    name.style.fontWeight = '500';
    name.style.lineHeight = '1.3';

    imgContainer.appendChild(logo);
    logoContainer.appendChild(imgContainer);
    logoContainer.appendChild(name);
    content.appendChild(logoContainer);
  });

  // Footer
  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.style.borderTop = '2px solid #333333';
  footer.style.paddingTop = '30px';
  footer.style.color = '#999999';
  footer.style.fontSize = '13px';

  const leftFooter = document.createElement('span');
  leftFooter.textContent = `Total de respuestas: ${totalResponses.toLocaleString()}`;

  const rightFooter = document.createElement('span');
  rightFooter.textContent = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
      useCORS: true,
      allowTaint: true,
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

