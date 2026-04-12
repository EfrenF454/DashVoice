export type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  background: string;
  surface: string;
  surfaceLight: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
  success: string;
  warning: string;
  info: string;
  border: string;
  overlay: string;
  chart: string[];
  // Neon glow helper (noop en otros temas)
  cardGlow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

export type ThemeName = 'default' | 'dark' | 'claro' | 'neon';

// ── Default (actual) ──────────────────────────────────────────────────────────
export const themeDefault: ThemeColors = {
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#4A42CC',
  secondary: '#00BFA5',
  secondaryLight: '#33CFBA',
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#252540',
  card: '#16213E',
  text: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted: '#606080',
  danger: '#FF6584',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  border: '#2A2A45',
  overlay: 'rgba(0,0,0,0.7)',
  chart: ['#6C63FF','#00BFA5','#FF6584','#FFB347','#4CAF50','#2196F3','#9C27B0','#FF5722','#00BCD4','#8BC34A'],
  cardGlow: { shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
};

// ── Dark (negros más profundos) ───────────────────────────────────────────────
export const themeDark: ThemeColors = {
  primary: '#985092',
  primaryLight: '#B870B2',
  primaryDark: '#723070',
  secondary: '#03DAC6',
  secondaryLight: '#4DEDE0',
  background: '#000000',
  surface: '#0D0D0D',
  surfaceLight: '#161616',
  card: '#111111',
  text: '#EFEFEF',
  textSecondary: '#888899',
  textMuted: '#484858',
  danger: '#CF6679',
  success: '#81C784',
  warning: '#FFB74D',
  info: '#64B5F6',
  border: '#1E1E1E',
  overlay: 'rgba(0,0,0,0.85)',
  chart: ['#985092','#03DAC6','#CF6679','#FFB74D','#81C784','#64B5F6','#CE93D8','#FF8A65','#4DD0E1','#AED581'],
  cardGlow: { shadowColor: '#985092', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
};

// ── Claro (fondos blancos, colores saturados) ─────────────────────────────────
export const themeClaro: ThemeColors = {
  primary: '#029fd8',
  primaryLight: '#33B8E8',
  primaryDark: '#0280B0',
  secondary: '#00897B',
  secondaryLight: '#26A69A',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceLight: '#F5F5FA',
  card: '#FAFAFF',
  text: '#1C1C1E',
  textSecondary: '#5A5A72',
  textMuted: '#9999AA',
  danger: '#E8294A',
  success: '#2E7D32',
  warning: '#E65100',
  info: '#0D47A1',
  border: '#DDDDF0',
  overlay: 'rgba(0,0,0,0.45)',
  chart: ['#029fd8','#00897B','#E8294A','#FF6D00','#2E7D32','#0D47A1','#6A1B9A','#BF360C','#00695C','#558B2F'],
  cardGlow: { shadowColor: '#029fd8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
};

// ── Neon (fondos traslucidos + external glow) ─────────────────────────────────
export const themeNeon: ThemeColors = {
  primary: '#01d8de',
  primaryLight: '#55E8EC',
  primaryDark: '#01A8AD',
  secondary: '#FF00FF',
  secondaryLight: '#FF66FF',
  background: '#060612',
  surface: 'rgba(10,10,28,0.92)',
  surfaceLight: 'rgba(18,18,40,0.88)',
  card: 'rgba(8,8,22,0.95)',
  text: '#FFFFFF',
  textSecondary: '#A0D4D8',
  textMuted: '#4A7A80',
  danger: '#FF1744',
  success: '#00FF88',
  warning: '#FF6600',
  info: '#00B0FF',
  border: 'rgba(1,216,222,0.22)',
  overlay: 'rgba(0,0,0,0.8)',
  chart: ['#01d8de','#FF00FF','#ADFF2F','#FF6600','#00FF88','#FF1744','#FFFF00','#FF69B4','#7B68EE','#00FFCC'],
  cardGlow: {
    shadowColor: '#01d8de',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 18,
  },
};

export const THEMES: Record<ThemeName, ThemeColors> = {
  default: themeDefault,
  dark: themeDark,
  claro: themeClaro,
  neon: themeNeon,
};

export const THEME_META: Record<ThemeName, { label: string; preview: string[] }> = {
  default: { label: 'Default',  preview: ['#0F0F1A', '#1A1A2E', '#6C63FF'] },
  dark:    { label: 'Dark',     preview: ['#000000', '#0D0D0D', '#985092'] },
  claro:   { label: 'Claro',    preview: ['#F2F2F7', '#FFFFFF', '#029fd8'] },
  neon:    { label: 'Neon',     preview: ['#060612', 'rgba(10,10,28,0.92)', '#01d8de'] },
};
