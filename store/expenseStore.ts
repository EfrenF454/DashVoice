import { create } from 'zustand';
import {
  obtenerGastos,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
  obtenerGastosPorAnio,
} from '@/services/supabase';
import type { Gasto, GastoInput, FiltroGastos, KPIData, GastoPorLugar, GastoPorConcepto, GastoPorMes, GastoPorTarjeta } from '@/types';
import { getConceptoColor } from '@/constants/Categories';
import { themeDefault as Colors } from '@/constants/themes';
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface ExpenseStore {
  gastos: Gasto[];
  cargando: boolean;
  error: string | null;
  filtros: FiltroGastos;

  // Acciones
  cargarGastos: (filtros?: FiltroGastos) => Promise<void>;
  agregarGasto: (gasto: GastoInput) => Promise<Gasto>;
  editarGasto: (id: string, gasto: Partial<GastoInput>) => Promise<void>;
  borrarGasto: (id: string) => Promise<void>;
  setFiltros: (filtros: FiltroGastos) => void;
  limpiarFiltros: () => void;

  // Computed (derivados)
  getKPIs: () => KPIData;
  getTopLugares: (top?: number) => GastoPorLugar[];
  getGastosMensuales: (meses?: number) => GastoPorMes[];
  getGastosPorConcepto: () => GastoPorConcepto[];
  getGastosPorTarjeta: () => GastoPorTarjeta[];
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  gastos: [],
  cargando: false,
  error: null,
  filtros: {},

  cargarGastos: async (filtros?: FiltroGastos) => {
    set({ cargando: true, error: null });
    try {
      const gastos = await obtenerGastos(filtros);
      set({ gastos, cargando: false });
    } catch (e) {
      set({ error: (e as Error).message, cargando: false });
    }
  },

  agregarGasto: async (gastoInput: GastoInput) => {
    set({ cargando: true, error: null });
    try {
      const nuevoGasto = await crearGasto(gastoInput);
      set((state) => ({
        gastos: [nuevoGasto, ...state.gastos],
        cargando: false,
      }));
      return nuevoGasto;
    } catch (e) {
      set({ error: (e as Error).message, cargando: false });
      throw e;
    }
  },

  editarGasto: async (id: string, gasto: Partial<GastoInput>) => {
    try {
      const actualizado = await actualizarGasto(id, gasto);
      set((state) => ({
        gastos: state.gastos.map((g) => (g.id === id ? actualizado : g)),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  borrarGasto: async (id: string) => {
    try {
      await eliminarGasto(id);
      set((state) => ({
        gastos: state.gastos.filter((g) => g.id !== id),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
      throw e;
    }
  },

  setFiltros: (filtros: FiltroGastos) => set({ filtros }),
  limpiarFiltros: () => set({ filtros: {} }),

  getKPIs: (): KPIData => {
    const { gastos } = get();
    const ahora = new Date();
    const anioActual = ahora.getFullYear().toString();
    const mesActualInicio = format(startOfMonth(ahora), 'yyyy-MM-dd');
    const mesActualFin = format(endOfMonth(ahora), 'yyyy-MM-dd');
    const mesAnteriorInicio = format(startOfMonth(subMonths(ahora, 1)), 'yyyy-MM-dd');
    const mesAnteriorFin = format(endOfMonth(subMonths(ahora, 1)), 'yyyy-MM-dd');

    const gastoAnual = gastos
      .filter((g) => g.fecha.startsWith(anioActual))
      .reduce((sum, g) => sum + g.monto, 0);

    const gastoMesActual = gastos
      .filter((g) => g.fecha >= mesActualInicio && g.fecha <= mesActualFin)
      .reduce((sum, g) => sum + g.monto, 0);

    const gastoMesAnterior = gastos
      .filter((g) => g.fecha >= mesAnteriorInicio && g.fecha <= mesAnteriorFin)
      .reduce((sum, g) => sum + g.monto, 0);

    const diferenciaMonto = gastoMesActual - gastoMesAnterior;
    const variacionPorcentual =
      gastoMesAnterior === 0
        ? 0
        : ((gastoMesActual - gastoMesAnterior) / gastoMesAnterior) * 100;

    return {
      gastoAnual,
      gastoMesAnterior,
      gastoMesActual,
      variacionPorcentual,
      diferenciaMonto,
    };
  },

  getTopLugares: (top = 10): GastoPorLugar[] => {
    const { gastos } = get();
    const mapa: Record<string, number> = {};

    gastos.forEach((g) => {
      mapa[g.lugar] = (mapa[g.lugar] ?? 0) + g.monto;
    });

    return Object.entries(mapa)
      .map(([lugar, total]) => ({ lugar, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, top);
  },

  getGastosMensuales: (meses = 6): GastoPorMes[] => {
    const { gastos } = get();
    const resultado: GastoPorMes[] = [];
    const ahora = new Date();

    for (let i = meses - 1; i >= 0; i--) {
      const fecha = subMonths(ahora, i);
      const inicio = format(startOfMonth(fecha), 'yyyy-MM-dd');
      const fin = format(endOfMonth(fecha), 'yyyy-MM-dd');
      const mes = format(fecha, 'MMM', { locale: es });
      const anio = fecha.getFullYear();

      const total = gastos
        .filter((g) => g.fecha >= inicio && g.fecha <= fin)
        .reduce((sum, g) => sum + g.monto, 0);

      resultado.push({ mes: mes.charAt(0).toUpperCase() + mes.slice(1), total, anio });
    }

    return resultado;
  },

  getGastosPorConcepto: (): GastoPorConcepto[] => {
    const { gastos } = get();
    const mapa: Record<string, number> = {};

    gastos.forEach((g) => {
      mapa[g.concepto] = (mapa[g.concepto] ?? 0) + g.monto;
    });

    const total = Object.values(mapa).reduce((s, v) => s + v, 0);

    return Object.entries(mapa)
      .map(([concepto, t]) => ({
        concepto,
        total: t,
        porcentaje: total > 0 ? (t / total) * 100 : 0,
        color: getConceptoColor(concepto),
      }))
      .sort((a, b) => b.total - a.total);
  },

  getGastosPorTarjeta: (): GastoPorTarjeta[] => {
    const { gastos } = get();
    const mapa: Record<string, number> = {};

    gastos.forEach((g) => {
      mapa[g.tarjeta] = (mapa[g.tarjeta] ?? 0) + g.monto;
    });

    return Object.entries(mapa)
      .map(([tarjeta, total], i) => ({
        tarjeta,
        total,
        color: Colors.chart[i % Colors.chart.length],
      }))
      .sort((a, b) => b.total - a.total);
  },
}));
