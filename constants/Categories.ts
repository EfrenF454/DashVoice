import { Colors } from './Colors';

export const CONCEPTOS = [
  'Gasolina',
  'Comida',
  'Restaurante',
  'Supermercado',
  'Ropa',
  'Entretenimiento',
  'Salud',
  'Farmacia',
  'Transporte',
  'Servicios',
  'Educación',
  'Hogar',
  'Tecnología',
  'Viajes',
  'Deporte',
  'Belleza',
  'Mascotas',
  'Regalos',
  'Suscripciones',
  'Otro',
];

export const TARJETAS = [
  'NU',
  'BBVA',
  'Banamex',
  'Banorte',
  'HSBC',
  'Santander',
  'American Express',
  'Efectivo',
  'Otro',
];

export const CONCEPTO_COLORES: Record<string, string> = {
  Gasolina: '#FF9800',
  Comida: '#4CAF50',
  Restaurante: '#8BC34A',
  Supermercado: '#00BCD4',
  Ropa: '#9C27B0',
  Entretenimiento: '#6C63FF',
  Salud: '#FF6584',
  Farmacia: '#F44336',
  Transporte: '#2196F3',
  Servicios: '#607D8B',
  Educación: '#FF5722',
  Hogar: '#795548',
  Tecnología: '#00BFA5',
  Viajes: '#FFB347',
  Deporte: '#4CAF50',
  Belleza: '#E91E63',
  Mascotas: '#FF9800',
  Regalos: '#FF4081',
  Suscripciones: '#673AB7',
  Otro: '#9E9E9E',
};

export function getConceptoColor(concepto: string, fallback?: string): string {
  return CONCEPTO_COLORES[concepto] ?? fallback ?? Colors.chart[0];
}
