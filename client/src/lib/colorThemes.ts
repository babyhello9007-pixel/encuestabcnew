/**
 * Temas de colores para infografías
 * Cada tema define una paleta completa de colores para garantizar visibilidad
 */

export type ColorTheme = 'light' | 'dark' | 'corporate';

export interface ThemeColors {
  name: string;
  description: string;
  background: string;
  text: string;
  textSecondary: string;
  accent: string;
  border: string;
  cardBg: string;
  cardBgAlt: string;
}

export const COLOR_THEMES: Record<ColorTheme, ThemeColors> = {
  light: {
    name: 'Claro',
    description: 'Fondo blanco con textos oscuros',
    background: '#FFFFFF',
    text: '#1D1D1F',
    textSecondary: '#666666',
    accent: '#C41E3A',
    border: '#E0E0E0',
    cardBg: '#F9F9F9',
    cardBgAlt: '#FFF5F7',
  },
  dark: {
    name: 'Oscuro',
    description: 'Fondo oscuro con textos claros',
    background: '#1D1D1F',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    accent: '#FF4757',
    border: '#333333',
    cardBg: '#2D2D2F',
    cardBgAlt: '#4A4A4C',
  },
  corporate: {
    name: 'Corporativo',
    description: 'Gradiente profesional con rojo corporativo',
    background: '#F5F5F5',
    text: '#1D1D1F',
    textSecondary: '#555555',
    accent: '#C41E3A',
    border: '#CCCCCC',
    cardBg: '#FFFFFF',
    cardBgAlt: '#FFF5F7',
  },
};

export function getThemeColors(theme: ColorTheme): ThemeColors {
  return COLOR_THEMES[theme];
}

export function getThemeList(): Array<{ id: ColorTheme; name: string; description: string }> {
  return Object.entries(COLOR_THEMES).map(([id, theme]) => ({
    id: id as ColorTheme,
    name: theme.name,
    description: theme.description,
  }));
}
