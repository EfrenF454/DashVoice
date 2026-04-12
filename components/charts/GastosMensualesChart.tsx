import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { formatMonto } from '@/utils/formatters';
import type { GastoPorMes } from '@/types';

const BAR_MAX_HEIGHT = 120;
const BAR_MIN_HEIGHT = 4;
const LABEL_AREA_H = 36;

interface BarProps {
  item: GastoPorMes;
  index: number;
  isSelected: boolean;
  hasSelection: boolean;
  barWidth: number;
  maxTotal: number;
  onPress: () => void;
}

function BarAnimada({ item, index, isSelected, hasSelection, barWidth, maxTotal, onPress }: BarProps) {
  const { colors } = useTheme();

  const targetHeight = useMemo(
    () => (maxTotal > 0 ? Math.max(BAR_MIN_HEIGHT, (item.total / maxTotal) * BAR_MAX_HEIGHT) : BAR_MIN_HEIGHT),
    [item.total, maxTotal],
  );

  const heightSV = useSharedValue(0);
  const opacidadSV = useSharedValue(1);
  const escalaSV = useSharedValue(1);

  useEffect(() => {
    heightSV.value = withTiming(targetHeight, { duration: 650 + index * 70 });
  }, [targetHeight]);

  useEffect(() => {
    opacidadSV.value = withTiming(hasSelection && !isSelected ? 0.25 : 1, { duration: 220 });
    escalaSV.value = withSpring(isSelected ? 1.08 : 1, { damping: 13, stiffness: 160 });
  }, [isSelected, hasSelection]);

  const barAnimStyle = useAnimatedStyle(() => ({
    height: heightSV.value,
    opacity: opacidadSV.value,
    transform: [{ scaleX: escalaSV.value }],
  }));

  const barInnerWidth = Math.max(barWidth * 0.58, 8);
  const barColor = isSelected ? colors.primary : colors.primaryLight;

  return (
    <Pressable onPress={onPress} style={[styles.barWrapper, { width: barWidth }]} hitSlop={6}>
      <View style={styles.valueLabelArea}>
        {isSelected && (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(150)}
            style={[styles.valueBubble, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.valueBubbleText}>{formatMonto(item.total, true)}</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.barArea}>
        <Animated.View
          style={[
            styles.bar,
            barAnimStyle,
            {
              width: barInnerWidth,
              backgroundColor: barColor,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isSelected ? 0.7 : 0,
              shadowRadius: 8,
              elevation: isSelected ? 8 : 0,
            },
          ]}
        />
      </View>

      <Text style={[styles.mesLabel, { color: colors.textMuted }, isSelected && { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
        {item.mes}
      </Text>
    </Pressable>
  );
}

interface Props {
  data: GastoPorMes[];
  width?: number;
  indiceMesSeleccionado: number | null;
  onMesSeleccionado: (indice: number | null) => void;
}

export function GastosMensualesChart({ data, width, indiceMesSeleccionado, onMesSeleccionado }: Props) {
  const { colors } = useTheme();
  const chartWidth = width ?? Dimensions.get('window').width - 32;

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin datos disponibles</Text>
      </View>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const barWidth = chartWidth / data.length;

  const handlePress = (index: number) => {
    onMesSeleccionado(indiceMesSeleccionado === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.chartRow, { width: chartWidth }]}>
        {data.map((item, i) => (
          <BarAnimada
            key={`${item.mes}-${item.anio}`}
            item={item}
            index={i}
            isSelected={indiceMesSeleccionado === i}
            hasSelection={indiceMesSeleccionado !== null}
            barWidth={barWidth}
            maxTotal={maxTotal}
            onPress={() => handlePress(i)}
          />
        ))}
      </View>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {indiceMesSeleccionado !== null
          ? 'Toca el mismo mes para quitar el filtro'
          : 'Toca un mes para filtrar el dashboard'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  chartRow: { flexDirection: 'row' },
  barWrapper: { alignItems: 'center' },
  valueLabelArea: { height: LABEL_AREA_H, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 4 },
  valueBubble: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  valueBubbleText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  barArea: { height: BAR_MAX_HEIGHT, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { borderRadius: 6 },
  mesLabel: { fontSize: 11, marginTop: 7, textAlign: 'center' },
  hint: { fontSize: 10, marginTop: 12, textAlign: 'center', fontStyle: 'italic' },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14 },
});
