// Re-exporta el tema default como objeto estático (retrocompatibilidad).
// Para colores reactivos al tema activo, usa useTheme() de @/contexts/ThemeContext.
export { themeDefault as Colors } from '@/constants/themes';
export type { ThemeColors } from '@/constants/themes';
