import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatFecha(fecha: string, patron = 'dd MMM yyyy'): string {
  try {
    const date = parseISO(fecha);
    if (!isValid(date)) return fecha;
    return format(date, patron, { locale: es });
  } catch {
    return fecha;
  }
}

export function fechaHoy(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function mesAnio(fecha: string): string {
  try {
    const date = parseISO(fecha);
    if (!isValid(date)) return '';
    return format(date, 'MMMM yyyy', { locale: es });
  } catch {
    return '';
  }
}

export function rangoMesActual(): { inicio: string; fin: string } {
  const ahora = new Date();
  const inicio = format(
    new Date(ahora.getFullYear(), ahora.getMonth(), 1),
    'yyyy-MM-dd'
  );
  const fin = format(
    new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0),
    'yyyy-MM-dd'
  );
  return { inicio, fin };
}

export function rangoAnioActual(): { inicio: string; fin: string } {
  const anio = new Date().getFullYear();
  return {
    inicio: `${anio}-01-01`,
    fin: `${anio}-12-31`,
  };
}
