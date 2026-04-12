export function formatMonto(monto: number, compact = false): string {
  if (compact && monto >= 1000) {
    return `$${(monto / 1000).toFixed(1)}k`;
  }
  return monto.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatPorcentaje(valor: number): string {
  const signo = valor >= 0 ? '+' : '';
  return `${signo}${valor.toFixed(1)}%`;
}

export function truncarTexto(texto: string, maxLen: number): string {
  if (texto.length <= maxLen) return texto;
  return `${texto.substring(0, maxLen)}…`;
}

export function capitalizarPrimera(texto: string): string {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}
