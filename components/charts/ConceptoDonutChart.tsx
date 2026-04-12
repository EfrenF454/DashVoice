import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Svg, { G, Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { formatMonto, truncarTexto } from '@/utils/formatters';
import type { GastoPorConcepto } from '@/types';

// ── Donut clásico ─────────────────────────────────────────────────────────────

interface DonutProps {
  data: GastoPorConcepto[];
  size?: number;
}

export function ConceptoDonutChart({ data, size = 200 }: DonutProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin datos disponibles</Text>
      </View>
    );
  }

  const topItems = data.slice(0, 6);
  const total = topItems.reduce((s, d) => s + d.total, 0);
  const radio = size / 2 - 4;
  const radioInterno = radio * 0.6;
  const cx = size / 2;
  const cy = size / 2;

  let anguloAcumulado = -Math.PI / 2;
  const sectores = topItems.map((item) => {
    const angulo = (item.total / total) * 2 * Math.PI;
    const inicio = anguloAcumulado;
    anguloAcumulado += angulo;
    const x1 = cx + radio * Math.cos(inicio);
    const y1 = cy + radio * Math.sin(inicio);
    const x2 = cx + radio * Math.cos(anguloAcumulado);
    const y2 = cy + radio * Math.sin(anguloAcumulado);
    const ix1 = cx + radioInterno * Math.cos(inicio);
    const iy1 = cy + radioInterno * Math.sin(inicio);
    const ix2 = cx + radioInterno * Math.cos(anguloAcumulado);
    const iy2 = cy + radioInterno * Math.sin(anguloAcumulado);
    const large = angulo > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${radio} ${radio} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${radioInterno} ${radioInterno} 0 ${large} 0 ${ix1} ${iy1} Z`;
    return { ...item, path };
  });

  return (
    <View style={styles.donutContainer}>
      <Svg width={size} height={size}>
        <G>
          {sectores.map((s) => (
            <G key={s.concepto}>
              <Circle cx={cx} cy={cy} r={radio} fill="none" stroke={colors.surface} strokeWidth={2} />
            </G>
          ))}
          {sectores.map((s) => (
            <G key={s.concepto}>
              <Circle cx={cx} cy={cy} r={radio} fill={s.color} stroke={colors.background} strokeWidth={2} />
            </G>
          ))}
        </G>
        <SvgText x={cx} y={cy - 8} textAnchor="middle" fill={colors.textSecondary} fontSize={11} fontFamily="System">
          Total
        </SvgText>
        <SvgText x={cx} y={cy + 12} textAnchor="middle" fill={colors.text} fontSize={13} fontWeight="bold" fontFamily="System">
          {formatMonto(total, true)}
        </SvgText>
      </Svg>
      <View style={styles.leyenda}>
        {topItems.map((item) => (
          <View key={item.concepto} style={styles.leyendaItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.leyendaLabel} numberOfLines={1}>{truncarTexto(item.concepto, 12)}</Text>
            <Text style={styles.leyendaPct}>{item.porcentaje.toFixed(1)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Barra de concepto individual ─────────────────────────────────────────────

interface BarraConceptoProps {
  item: GastoPorConcepto;
  index: number;
  maxPorcentaje: number;
  isSelected: boolean;
  hasSelection: boolean;
  onPress: () => void;
}

function BarraConcepto({ item, index, maxPorcentaje, isSelected, hasSelection, onPress }: BarraConceptoProps) {
  const { colors } = useTheme();
  const [containerW, setContainerW] = useState(0);
  const widthSV = useSharedValue(0);
  const opacidadSV = useSharedValue(1);
  const escalaSV = useSharedValue(1);
  const color = colors.chart[index % colors.chart.length];

  // Escala relativa al mayor: el mayor ocupa 100% del ancho
  const fraccion = maxPorcentaje > 0 ? item.porcentaje / maxPorcentaje : 0;

  useEffect(() => {
    if (containerW > 0) {
      widthSV.value = withTiming(containerW * fraccion, {
        duration: 550 + index * 55,
      });
    }
  }, [containerW, fraccion]);

  useEffect(() => {
    opacidadSV.value = withTiming(hasSelection && !isSelected ? 0.22 : 1, { duration: 220 });
    escalaSV.value = withSpring(isSelected ? 1.01 : 1, { damping: 14, stiffness: 160 });
  }, [isSelected, hasSelection]);

  const rowStyle = useAnimatedStyle(() => ({
    opacity: opacidadSV.value,
    transform: [{ scaleY: escalaSV.value }],
  }));
  const barStyle = useAnimatedStyle(() => ({ width: widthSV.value }));

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Animated.View style={rowStyle}>
      <Pressable onPress={onPress} style={styles.fila} hitSlop={4}>
        <Text
          style={[styles.label, isSelected && { color: colors.text, fontWeight: '700' }]}
          numberOfLines={1}
        >
          {truncarTexto(item.concepto, 14)}
        </Text>

        <View
          style={styles.barraFondo}
          onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
        >
          <Animated.View
            style={[
              styles.barraRelleno,
              {
                backgroundColor: color,
                shadowColor: color,
                shadowOpacity: isSelected ? 0.5 : 0,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
                elevation: isSelected ? 4 : 0,
              },
              barStyle,
            ]}
          />
        </View>

        <Text style={[styles.valor, isSelected && { color }]}>
          {formatMonto(item.total, true)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Chart público ─────────────────────────────────────────────────────────────

interface PieSimpleProps {
  data: GastoPorConcepto[];
  width?: number;
  conceptoSeleccionado?: string | null;
  onConceptoSeleccionado?: (concepto: string | null) => void;
}

export function ConceptoPieChartSimple({
  data,
  conceptoSeleccionado,
  onConceptoSeleccionado,
}: PieSimpleProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (data.length === 0) return null;

  const topItems = data.slice(0, 6);
  const maxPorcentaje = topItems[0]?.porcentaje ?? 100;
  const hasSelection = conceptoSeleccionado != null;

  const handlePress = (concepto: string) => {
    onConceptoSeleccionado?.(conceptoSeleccionado === concepto ? null : concepto);
  };

  return (
    <View>
      {topItems.map((item, i) => (
        <BarraConcepto
          key={item.concepto}
          item={item}
          index={i}
          maxPorcentaje={maxPorcentaje}
          isSelected={conceptoSeleccionado === item.concepto}
          hasSelection={hasSelection}
          onPress={() => handlePress(item.concepto)}
        />
      ))}
      <Text style={styles.hint}>Toca un concepto para filtrar</Text>
    </View>
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    donutContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    empty: { alignItems: 'center', paddingVertical: 24 },
    emptyText: { color: c.textMuted, fontSize: 14 },
    leyenda: { flex: 1, gap: 8 },
    leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    leyendaLabel: { flex: 1, color: c.textSecondary, fontSize: 12 },
    leyendaPct: { color: c.text, fontSize: 12, fontWeight: '600', minWidth: 40, textAlign: 'right' },
    fila: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    label: { width: 100, color: c.textSecondary, fontSize: 11 },
    valor: { width: 68, color: c.text, fontSize: 11, fontWeight: '600', textAlign: 'right' },
    barraFondo: { flex: 1, height: 20, backgroundColor: c.border, borderRadius: 5, overflow: 'hidden' },
    barraRelleno: { height: '100%', borderRadius: 5 },
    hint: { color: c.textMuted, fontSize: 10, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
  });
}
