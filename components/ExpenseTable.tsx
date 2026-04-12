import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatMonto } from '@/utils/formatters';
import { formatFecha } from '@/utils/dateUtils';
import { getConceptoColor } from '@/constants/Categories';
import type { Gasto } from '@/types';

interface Props {
  gastos: Gasto[];
  onEliminar: (id: string) => void;
  onEditar?: (gasto: Gasto) => void;
  cargando?: boolean;
}

export function ExpenseTable({ gastos, onEliminar, onEditar, cargando }: Props) {
  const { colors } = useTheme();
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const confirmarEliminar = (gasto: Gasto) => {
    Alert.alert(
      'Eliminar gasto',
      `¿Eliminar $${formatMonto(gasto.monto)} en ${gasto.lugar}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onEliminar(gasto.id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Gasto }) => {
    const expandido = expandidoId === item.id;
    const color = getConceptoColor(item.concepto, colors.chart[0]);

    return (
      <TouchableOpacity
        style={styles.fila}
        onPress={() => setExpandidoId(expandido ? null : item.id)}
        activeOpacity={0.75}
      >
        {/* Indicador de color por concepto */}
        <View style={[styles.colorBar, { backgroundColor: color }]} />

        <View style={styles.filaContenido}>
          {/* Fila principal */}
          <View style={styles.filaPrincipal}>
            <View style={styles.lugarConcepto}>
              <Text style={styles.lugar} numberOfLines={1}>
                {item.lugar}
              </Text>
              <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
                <Text style={[styles.badgeTexto, { color }]}>{item.concepto}</Text>
              </View>
            </View>
            <View style={styles.montoFecha}>
              <Text style={styles.monto}>{formatMonto(item.monto)}</Text>
              <Text style={styles.fecha}>{formatFecha(item.fecha, 'dd MMM')}</Text>
            </View>
          </View>

          {/* Detalle expandido */}
          {expandido && (
            <View style={styles.detalle}>
              <View style={styles.detalleRow}>
                <Text style={styles.detalleLabel}>Tarjeta</Text>
                <Text style={styles.detalleValor}>{item.tarjeta}</Text>
              </View>
              <View style={styles.detalleRow}>
                <Text style={styles.detalleLabel}>Fecha completa</Text>
                <Text style={styles.detalleValor}>{formatFecha(item.fecha, 'dd MMMM yyyy')}</Text>
              </View>
              {item.audio_transcripcion && (
                <View style={styles.detalleRow}>
                  <Text style={styles.detalleLabel}>Nota de voz</Text>
                  <Text style={[styles.detalleValor, styles.transcripcion]} numberOfLines={2}>
                    {item.audio_transcripcion}
                  </Text>
                </View>
              )}

              <View style={styles.accionesRow}>
                {onEditar && (
                  <TouchableOpacity
                    style={[styles.accionBtn, { borderColor: colors.primary }]}
                    onPress={() => onEditar(item)}
                  >
                    <Text style={[styles.accionTexto, { color: colors.primary }]}>Editar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.accionBtn, { borderColor: colors.danger }]}
                  onPress={() => confirmarEliminar(item)}
                >
                  <Text style={[styles.accionTexto, { color: colors.danger }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (gastos.length === 0 && !cargando) {
    return (
      <View style={styles.vacio}>
        <Text style={styles.vacioIcono}>📭</Text>
        <Text style={styles.vacioTexto}>Sin gastos registrados</Text>
        <Text style={styles.vacioSubtexto}>Graba tu primer gasto con el micrófono</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={gastos}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <View style={styles.separador} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.lista}
    />
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    lista: {
      paddingBottom: 24,
    },
    fila: {
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    colorBar: {
      width: 4,
    },
    filaContenido: {
      flex: 1,
      padding: 14,
    },
    filaPrincipal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    lugarConcepto: {
      flex: 1,
      marginRight: 12,
      gap: 4,
    },
    lugar: {
      color: c.text,
      fontSize: 15,
      fontWeight: '600',
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    badgeTexto: {
      fontSize: 11,
      fontWeight: '500',
    },
    montoFecha: {
      alignItems: 'flex-end',
      gap: 4,
    },
    monto: {
      color: c.text,
      fontSize: 16,
      fontWeight: '700',
    },
    fecha: {
      color: c.textMuted,
      fontSize: 11,
    },
    detalle: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.border,
      gap: 8,
    },
    detalleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    detalleLabel: {
      color: c.textMuted,
      fontSize: 12,
      minWidth: 90,
    },
    detalleValor: {
      color: c.textSecondary,
      fontSize: 12,
      flex: 1,
      textAlign: 'right',
    },
    transcripcion: {
      fontStyle: 'italic',
    },
    accionesRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 8,
    },
    accionBtn: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1,
    },
    accionTexto: {
      fontSize: 13,
      fontWeight: '600',
    },
    separador: {
      height: 8,
    },
    vacio: {
      alignItems: 'center',
      paddingVertical: 60,
      gap: 8,
    },
    vacioIcono: {
      fontSize: 48,
    },
    vacioTexto: {
      color: c.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    vacioSubtexto: {
      color: c.textMuted,
      fontSize: 13,
    },
  });
}
