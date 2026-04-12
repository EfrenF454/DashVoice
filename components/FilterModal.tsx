import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CONCEPTOS, TARJETAS } from '@/constants/Categories';
import { fechaHoy } from '@/utils/dateUtils';
import type { FiltroGastos } from '@/types';

interface Props {
  visible: boolean;
  filtros: FiltroGastos;
  onAplicar: (filtros: FiltroGastos) => void;
  onLimpiar: () => void;
  onCerrar: () => void;
}

export function FilterModal({ visible, filtros, onAplicar, onLimpiar, onCerrar }: Props) {
  const { colors } = useTheme();
  const [localFiltros, setLocalFiltros] = useState<FiltroGastos>(filtros);

  const styles = useMemo(() => createStyles(colors), [colors]);

  React.useEffect(() => {
    setLocalFiltros(filtros);
  }, [filtros, visible]);

  const setField = (key: keyof FiltroGastos, value: string | undefined) => {
    setLocalFiltros((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Filtros</Text>
            <TouchableOpacity onPress={onCerrar}>
              <Text style={styles.cerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Rango de fechas */}
            <Text style={styles.seccionLabel}>Rango de fechas</Text>
            <View style={styles.fechaRow}>
              <View style={styles.fechaItem}>
                <Text style={styles.campoLabel}>Desde</Text>
                <TextInput
                  style={styles.input}
                  value={localFiltros.fechaInicio ?? ''}
                  onChangeText={(v) => setField('fechaInicio', v || undefined)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  selectionColor={colors.primary}
                />
              </View>
              <View style={styles.fechaItem}>
                <Text style={styles.campoLabel}>Hasta</Text>
                <TextInput
                  style={styles.input}
                  value={localFiltros.fechaFin ?? ''}
                  onChangeText={(v) => setField('fechaFin', v || undefined)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  selectionColor={colors.primary}
                />
              </View>
            </View>

            {/* Tarjeta */}
            <Text style={styles.seccionLabel}>Tarjeta</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  !localFiltros.tarjeta && styles.chipActivo,
                ]}
                onPress={() => setField('tarjeta', undefined)}
              >
                <Text style={[styles.chipTexto, !localFiltros.tarjeta && styles.chipTextoActivo]}>
                  Todas
                </Text>
              </TouchableOpacity>
              {TARJETAS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.chip,
                    localFiltros.tarjeta === t && styles.chipActivo,
                  ]}
                  onPress={() => setField('tarjeta', localFiltros.tarjeta === t ? undefined : t)}
                >
                  <Text
                    style={[
                      styles.chipTexto,
                      localFiltros.tarjeta === t && styles.chipTextoActivo,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Concepto */}
            <Text style={styles.seccionLabel}>Concepto</Text>
            <View style={styles.conceptoGrid}>
              {CONCEPTOS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    localFiltros.concepto === c && styles.chipActivo,
                  ]}
                  onPress={() =>
                    setField('concepto', localFiltros.concepto === c ? undefined : c)
                  }
                >
                  <Text
                    style={[
                      styles.chipTexto,
                      localFiltros.concepto === c && styles.chipTextoActivo,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.botonesRow}>
            <TouchableOpacity
              style={styles.btnLimpiar}
              onPress={() => {
                setLocalFiltros({});
                onLimpiar();
              }}
            >
              <Text style={styles.btnLimpiarTexto}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnAplicar} onPress={() => onAplicar(localFiltros)}>
              <Text style={styles.btnAplicarTexto}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: c.overlay,
    },
    container: {
      backgroundColor: c.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: '85%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    titulo: {
      color: c.text,
      fontSize: 20,
      fontWeight: '700',
    },
    cerrar: {
      color: c.textSecondary,
      fontSize: 18,
      padding: 4,
    },
    seccionLabel: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
      marginTop: 16,
    },
    fechaRow: {
      flexDirection: 'row',
      gap: 12,
    },
    fechaItem: {
      flex: 1,
    },
    campoLabel: {
      color: c.textSecondary,
      fontSize: 12,
      marginBottom: 6,
    },
    input: {
      backgroundColor: c.surfaceLight,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: c.text,
      fontSize: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    chips: {
      marginBottom: 4,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: c.surfaceLight,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    chipActivo: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    chipTexto: {
      color: c.textSecondary,
      fontSize: 13,
    },
    chipTextoActivo: {
      color: '#fff',
      fontWeight: '600',
    },
    conceptoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    botonesRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    btnLimpiar: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: c.surfaceLight,
    },
    btnLimpiarTexto: {
      color: c.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
    btnAplicar: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: c.primary,
    },
    btnAplicarTexto: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
    },
  });
}
