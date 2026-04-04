import html2canvas from 'html2canvas';

interface PartyStats {
  id?: string;
  nombre: string;
  votos: number;
  porcentaje: number;
  escanos: number;
  logo: string;
  color?: string;
}

const getLogoForParty = (_partyId: string, _partyName: string, _activeTab: "general" | "youth", fallbackLogo?: string): string => {
  if (fallbackLogo) return fallbackLogo;
  return '';
};

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
  container.style.backgroundColor = '#FFFFFF';
  container.style.padding = '60px';
  container.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.justifyContent = 'space-between';
  container.style.minHeight = '100vh';
  container.style.color = '#1D1D1F';

  // Header
  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = '50px';
  header.style.borderBottom = '2px solid #C41E3A';
  header.style.paddingBottom = '30px';

  const logoContainer = document.createElement('div');
  logoContainer.style.marginBottom = '20px';
  const logoImg = document.createElement('img');
  logoImg.src = '/favicon.png';
  logoImg.style.width = '60px';
  logoImg.style.height = '60px';
  logoContainer.appendChild(logoImg);

  const title = document.createElement('h1');
  title.textContent = 'Batalla Cultural';
  title.style.color = '#C41E3A';
  title.style.fontSize = '48px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0 0 10px 0';
  title.style.letterSpacing = '0.5px';

  const subtitle = document.createElement('p');
  subtitle.textContent = activeTab === 'general' ? 'Elecciones Generales' : 'Asociaciones Juveniles';
  subtitle.style.color = '#666666';
  subtitle.style.fontSize = '20px';
  subtitle.style.margin = '0';
  subtitle.style.fontWeight = '400';

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
    box.style.backgroundColor = '#F9F9F9';
    box.style.border = '1px solid #E0E0E0';
    box.style.borderRadius = '8px';
    box.style.padding = '25px';
    box.style.textAlign = 'center';

    const labelEl = document.createElement('p');
    labelEl.textContent = label;
    labelEl.style.color = '#999999';
    labelEl.style.fontSize = '13px';
    labelEl.style.margin = '0 0 10px 0';
    labelEl.style.textTransform = 'uppercase';
    labelEl.style.letterSpacing = '0.5px';
    labelEl.style.fontWeight = '600';

    const valueEl = document.createElement('p');
    valueEl.textContent = value;
    valueEl.style.color = '#C41E3A';
    valueEl.style.fontSize = '32px';
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
    card.style.backgroundColor = '#FFFFFF';
    card.style.border = `2px solid ${party.color || '#C41E3A'}`;
    card.style.borderRadius = '12px';
    card.style.padding = '30px';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = '25px';

    // Logo
    const logoSection = document.createElement('div');
    logoSection.style.flexShrink = '0';
    const logo = document.createElement('img');
    const logoUrl = getLogoForParty(party.id || '', party.nombre, activeTab, party.logo);
    logo.src = logoUrl || party.logo;
    logo.crossOrigin = 'anonymous';
    logo.referrerPolicy = 'no-referrer';
    logo.style.width = '100px';
    logo.style.height = '100px';
    logo.style.objectFit = 'contain';
    logo.style.backgroundColor = '#F9F9F9';
    logo.style.borderRadius = '8px';
    logo.style.padding = '10px';
    logoSection.appendChild(logo);

    // Info
    const info = document.createElement('div');
    info.style.flex = '1';

    const name = document.createElement('h3');
    name.textContent = party.nombre;
    name.style.color = '#1D1D1F';
    name.style.fontSize = '20px';
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
      l.style.fontSize = '11px';
      l.style.margin = '0 0 5px 0';
      l.style.fontWeight = '600';
      const v = document.createElement('p');
      v.textContent = value;
      v.style.color = color;
      v.style.fontSize = '18px';
      v.style.fontWeight = 'bold';
      v.style.margin = '0';
      stat.appendChild(l);
      stat.appendChild(v);
      return stat;
    };

    stats.appendChild(createStat('Votos', party.votos.toLocaleString(), party.color || '#C41E3A'));
    stats.appendChild(createStat('Porcentaje', `${party.porcentaje.toFixed(1)}%`, '#1D1D1F'));
    stats.appendChild(createStat('Escaños', party.escanos.toString(), party.color || '#C41E3A'));

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
  footer.style.borderTop = '1px solid #E0E0E0';
  footer.style.paddingTop = '30px';
  footer.style.color = '#999999';
  footer.style.fontSize = '12px';

  const leftFooter = document.createElement('span');
  leftFooter.textContent = 'Batalla Cultural © 2025';

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
      backgroundColor: '#FFFFFF',
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Convertir a imagen
    const image = canvas.toDataURL('image/png');

    // Descargar
    const link = document.createElement('a');
    link.href = image;
    link.download = `batalla-cultural-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
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
  container.style.backgroundColor = '#FFFFFF';
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
  header.style.borderBottom = '2px solid #C41E3A';
  header.style.paddingBottom = '30px';

  const logoContainer = document.createElement('div');
  logoContainer.style.marginBottom = '20px';
  const logoImg = document.createElement('img');
  logoImg.src = '/favicon.png';
  logoImg.style.width = '60px';
  logoImg.style.height = '60px';
  logoContainer.appendChild(logoImg);

  const title = document.createElement('h1');
  title.textContent = 'Batalla Cultural';
  title.style.color = '#C41E3A';
  title.style.fontSize = '48px';
  title.style.fontWeight = 'bold';
  title.style.margin = '0 0 10px 0';
  title.style.letterSpacing = '0.5px';

  const subtitle = document.createElement('p');
  subtitle.textContent = activeTab === 'general' ? 'Todos los Partidos Políticos' : 'Todas las Asociaciones Juveniles';
  subtitle.style.color = '#666666';
  subtitle.style.fontSize = '20px';
  subtitle.style.margin = '0';
  subtitle.style.fontWeight = '400';

  header.appendChild(logoContainer);
  header.appendChild(title);
  header.appendChild(subtitle);

  // Content - Grid de logos con nombres
  const content = document.createElement('div');
  content.style.display = 'grid';
  content.style.gridTemplateColumns = 'repeat(5, 1fr)';
  content.style.gap = '30px';
  content.style.marginBottom = '50px';

  const data = activeTab === 'general' ? PARTIES_GENERAL : YOUTH_ASSOCIATIONS;

  Object.entries(data).forEach(([key, party]) => {
    const logoCard = document.createElement('div');
    logoCard.style.textAlign = 'center';
    logoCard.style.display = 'flex';
    logoCard.style.flexDirection = 'column';
    logoCard.style.alignItems = 'center';
    logoCard.style.gap = '15px';

    const logoImg = document.createElement('img');
    logoImg.src = party.logo;
    logoImg.style.width = '80px';
    logoImg.style.height = '80px';
    logoImg.style.objectFit = 'contain';
    logoImg.style.backgroundColor = '#F9F9F9';
    logoImg.style.borderRadius = '8px';
    logoImg.style.padding = '8px';

    const nameEl = document.createElement('p');
    nameEl.textContent = party.name;
    nameEl.style.color = '#1D1D1F';
    nameEl.style.fontSize = '13px';
    nameEl.style.fontWeight = '600';
    nameEl.style.margin = '0';
    nameEl.style.lineHeight = '1.3';

    logoCard.appendChild(logoImg);
    logoCard.appendChild(nameEl);
    content.appendChild(logoCard);
  });

  // Footer
  const footer = document.createElement('div');
  footer.style.textAlign = 'center';
  footer.style.borderTop = '1px solid #E0E0E0';
  footer.style.paddingTop = '30px';
  footer.style.color = '#999999';
  footer.style.fontSize = '12px';

  const footerText = document.createElement('p');
  footerText.textContent = `Batalla Cultural © 2025 | ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  footerText.style.margin = '0';

  footer.appendChild(footerText);

  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(footer);

  document.body.appendChild(container);

  try {
    // Generar canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#FFFFFF',
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    // Convertir a imagen
    const image = canvas.toDataURL('image/png');

    // Descargar
    const link = document.createElement('a');
    link.href = image;
    link.download = `batalla-cultural-todos-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
    link.click();

    return image;
  } finally {
    document.body.removeChild(container);
  }
};
