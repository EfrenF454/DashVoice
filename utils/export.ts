import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { utils, write } from 'xlsx';
import type { Gasto } from '@/types';
import { formatFecha } from './dateUtils';

export async function exportarExcel(gastos: Gasto[]): Promise<void> {
  const filas = gastos.map((g) => ({
    Fecha: formatFecha(g.fecha, 'dd/MM/yyyy'),
    Tarjeta: g.tarjeta,
    Lugar: g.lugar,
    Concepto: g.concepto,
    Monto: g.monto,
  }));

  const ws = utils.json_to_sheet(filas);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Gastos');

  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 12 },
    { wch: 15 },
    { wch: 25 },
    { wch: 20 },
    { wch: 12 },
  ];

  const wbout = write(wb, { type: 'base64', bookType: 'xlsx' });
  const uri = `${FileSystem.cacheDirectory}gastos_${Date.now()}.xlsx`;

  await FileSystem.writeAsStringAsync(uri, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Exportar gastos',
      UTI: 'com.microsoft.excel.xlsx',
    });
  }
}

export async function exportarCSV(gastos: Gasto[]): Promise<void> {
  const encabezado = 'Fecha,Tarjeta,Lugar,Concepto,Monto\n';
  const filas = gastos
    .map(
      (g) =>
        `${formatFecha(g.fecha, 'dd/MM/yyyy')},${g.tarjeta},"${g.lugar}",${g.concepto},${g.monto}`
    )
    .join('\n');

  const csv = encabezado + filas;
  const uri = `${FileSystem.cacheDirectory}gastos_${Date.now()}.csv`;

  await FileSystem.writeAsStringAsync(uri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Exportar gastos CSV',
    });
  }
}
