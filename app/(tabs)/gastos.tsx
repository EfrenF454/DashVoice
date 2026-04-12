import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ExpenseTable } from '@/components/ExpenseTable';
import { FilterModal } from '@/components/FilterModal';
import { useExpenseStore } from '@/store/expenseStore';
import { exportarExcel, exportarCSV } from '@/utils/export';
import { formatMonto } from '@/utils/formatters';
import type { FiltroGastos } from '@/types';

export default function GastosScreen() {
  const { colors } = useTheme();
  const { gastos, cargarGastos, borrarGasto, cargando, filtros, setFiltros, limpiarFiltros } =
    useExpenseStore();

  const [busqueda, setBusqueda] = useState('');
  const [filtroVisible, setFiltroVisible] = useState(false);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    cargarGastos(filtros);
  }, [filtros]);

  const gastosFiltrados = gastos.filter((g) => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      g.lugar.toLowerCase().includes(q) ||
      g.concepto.toLowerCase().includes(q) ||
      g.tarjeta.toLowerCase().includes(q)
    );
  });

  const totalFiltrado = gastosFiltrados.reduce((s, g) => s + g.monto, 0);
  const hayFiltros = Object.values(filtros).some(Boolean);

  const handleExportExcel = async () => {
    setExportMenuVisible(false);
    try {
      await exportarExcel(gastosFiltrados);
    } catch (e) {
      Alert.alert('Error al exportar', (e as Error).message);
    }
  };

  const handleExportCSV = async () => {
    setExportMenuVisible(false);
    try {
      await exportarCSV(gastosFiltrados);
    } catch (e) {
      Alert.alert('Error al exportar', (e as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.titulo}>Mis Gastos</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconBtn, hayFiltros && styles.iconBtnActivo]}
              onPress={() => setFiltroVisible(true)}
            >
              <Text style={styles.iconBtnTexto}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setExportMenuVisible(true)}>
              <Text style={styles.iconBtnTexto}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Buscador */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcono}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar lugar, concepto o tarjeta…"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.primary}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Text style={styles.searchLimpiar}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resumen */}
        <View style={styles.resumenRow}>
          <Text style={styles.resumenConteo}>
            {gastosFiltrados.length} gasto{gastosFiltrados.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.resumenTotal}>{formatMonto(totalFiltrado)}</Text>
        </View>

        {/* Chips de filtros activos */}
        {hayFiltros && (
          <View style={styles.filtrosActivosRow}>
            <Text style={styles.filtrosActivosLabel}>Filtros activos:</Text>
            {filtros.tarjeta && (
              <View style={styles.filtroChip}>
                <Text style={styles.filtroChipTexto}>{filtros.tarjeta}</Text>
              </View>
            )}
            {filtros.concepto && (
              <View style={styles.filtroChip}>
                <Text style={styles.filtroChipTexto}>{filtros.concepto}</Text>
              </View>
            )}
            {filtros.fechaInicio && (
              <View style={styles.filtroChip}>
                <Text style={styles.filtroChipTexto}>Desde {filtros.fechaInicio}</Text>
              </View>
            )}
            <TouchableOpacity onPress={limpiarFiltros}>
              <Text style={styles.filtroLimpiar}>Limpiar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tabla de gastos */}
      <View style={styles.listaContainer}>
        <ExpenseTable
          gastos={gastosFiltrados}
          onEliminar={borrarGasto}
          cargando={cargando}
        />
      </View>

      {/* Modal de filtros */}
      <FilterModal
        visible={filtroVisible}
        filtros={filtros}
        onAplicar={(f: FiltroGastos) => {
          setFiltros(f);
          setFiltroVisible(false);
        }}
        onLimpiar={() => {
          limpiarFiltros();
          setFiltroVisible(false);
        }}
        onCerrar={() => setFiltroVisible(false)}
      />

      {/* Menu de exportación */}
      {exportMenuVisible && (
        <View style={styles.exportOverlay}>
          <TouchableOpacity
            style={styles.exportOverlayFondo}
            onPress={() => setExportMenuVisible(false)}
          />
          <View style={styles.exportMenu}>
            <Text style={styles.exportTitulo}>Exportar {gastosFiltrados.length} gastos</Text>
            <TouchableOpacity style={styles.exportItem} onPress={handleExportExcel}>
              <Text style={styles.exportItemIcono}>📊</Text>
              <View>
                <Text style={styles.exportItemTexto}>Excel (.xlsx)</Text>
                <Text style={styles.exportItemSub}>Para analizar en Excel o Google Sheets</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportItem} onPress={handleExportCSV}>
              <Text style={styles.exportItemIcono}>📄</Text>
              <View>
                <Text style={styles.exportItemTexto}>CSV</Text>
                <Text style={styles.exportItemSub}>Formato de texto separado por comas</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      padding: 16,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titulo: {
      color: c.text,
      fontSize: 24,
      fontWeight: '800',
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    iconBtnActivo: {
      borderColor: c.primary,
      backgroundColor: `${c.primary}22`,
    },
    iconBtnTexto: {
      fontSize: 18,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      gap: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    searchIcono: {
      fontSize: 16,
    },
    searchInput: {
      flex: 1,
      color: c.text,
      fontSize: 14,
      paddingVertical: 12,
    },
    searchLimpiar: {
      color: c.textMuted,
      fontSize: 14,
      padding: 4,
    },
    resumenRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resumenConteo: {
      color: c.textMuted,
      fontSize: 13,
    },
    resumenTotal: {
      color: c.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    filtrosActivosRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      alignItems: 'center',
    },
    filtrosActivosLabel: {
      color: c.textMuted,
      fontSize: 12,
    },
    filtroChip: {
      backgroundColor: `${c.primary}22`,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: c.primary,
    },
    filtroChipTexto: {
      color: c.primary,
      fontSize: 11,
      fontWeight: '500',
    },
    filtroLimpiar: {
      color: c.danger,
      fontSize: 12,
      fontWeight: '600',
    },
    listaContainer: {
      flex: 1,
      padding: 16,
    },
    exportOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
    },
    exportOverlayFondo: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.overlay,
    },
    exportMenu: {
      backgroundColor: c.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      gap: 4,
    },
    exportTitulo: {
      color: c.text,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 8,
    },
    exportItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 14,
      backgroundColor: c.surfaceLight,
      borderRadius: 12,
      marginBottom: 8,
    },
    exportItemIcono: {
      fontSize: 28,
    },
    exportItemTexto: {
      color: c.text,
      fontSize: 15,
      fontWeight: '600',
    },
    exportItemSub: {
      color: c.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
  });
}
