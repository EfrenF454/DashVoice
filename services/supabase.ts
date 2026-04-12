import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Gasto, GastoInput, FiltroGastos } from '@/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('No hay sesión activa.');
  return session.user.id;
}

// ── Gastos ────────────────────────────────────────────────────────────────────

export async function crearGastos(gastos: GastoInput[]): Promise<number> {
  const user_id = await getUserId();
  const gastosConUsuario = gastos.map((g) => ({ ...g, user_id }));
  const { data, error } = await supabase
    .from('gastos')
    .insert(gastosConUsuario)
    .select();
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

export async function crearGasto(gasto: GastoInput): Promise<Gasto> {
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from('gastos')
    .insert([{ ...gasto, user_id }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Gasto;
}

export async function obtenerGastos(filtros?: FiltroGastos): Promise<Gasto[]> {
  let query = supabase
    .from('gastos')
    .select('*')
    .order('fecha', { ascending: false });

  if (filtros?.fechaInicio) {
    query = query.gte('fecha', filtros.fechaInicio);
  }
  if (filtros?.fechaFin) {
    query = query.lte('fecha', filtros.fechaFin);
  }
  if (filtros?.tarjeta) {
    query = query.eq('tarjeta', filtros.tarjeta);
  }
  if (filtros?.concepto) {
    query = query.eq('concepto', filtros.concepto);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Gasto[];
}

export async function actualizarGasto(id: string, gasto: Partial<GastoInput>): Promise<Gasto> {
  const { data, error } = await supabase
    .from('gastos')
    .update(gasto)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Gasto;
}

export async function eliminarGasto(id: string): Promise<void> {
  const { error } = await supabase.from('gastos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function obtenerGastosPorAnio(anio: number): Promise<Gasto[]> {
  const inicio = `${anio}-01-01`;
  const fin = `${anio}-12-31`;

  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .gte('fecha', inicio)
    .lte('fecha', fin)
    .order('fecha', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Gasto[];
}

export async function obtenerPresupuesto(): Promise<number> {
  const stored = await AsyncStorage.getItem('presupuesto_mensual');
  return stored ? Number(stored) : 10000;
}

export async function guardarPresupuesto(monto: number): Promise<void> {
  await AsyncStorage.setItem('presupuesto_mensual', String(monto));
}
