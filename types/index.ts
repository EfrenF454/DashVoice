export interface Gasto {
  id: string;
  tarjeta: string;
  lugar: string;
  concepto: string;
  monto: number;
  fecha: string; // YYYY-MM-DD
  audio_transcripcion?: string;
  created_at?: string;
  user_id?: string;
}

export interface GastoInput {
  tarjeta: string;
  lugar: string;
  concepto: string;
  monto: number;
  fecha: string;
  audio_transcripcion?: string;
  user_id?: string;
}

export interface KPIData {
  gastoAnual: number;
  gastoMesAnterior: number;
  gastoMesActual: number;
  variacionPorcentual: number;
  diferenciaMonto: number;
}

export interface GastoPorLugar {
  lugar: string;
  total: number;
}

export interface GastoPorConcepto {
  concepto: string;
  total: number;
  porcentaje: number;
  color: string;
}

export interface GastoPorMes {
  mes: string; // "Ene", "Feb", etc.
  total: number;
  anio: number;
}

export interface GastoPorTarjeta {
  tarjeta: string;
  total: number;
  color: string;
}

export interface FiltroGastos {
  fechaInicio?: string;
  fechaFin?: string;
  tarjeta?: string;
  concepto?: string;
}

export interface Presupuesto {
  mensual: number;
  alertaEnPorcentaje: number; // 80 = alertar al 80%
}

export interface ParsedExpenseResponse {
  tarjeta: string;
  lugar: string;
  concepto: string;
  monto: number;
  fecha: string;
}
