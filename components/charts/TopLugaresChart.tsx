import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { formatMonto, truncarTexto } from '@/utils/formatters';
import type { GastoPorLugar } from '@/types';

interface BarraProps {
  item: GastoPorLugar;
  index: number;
  maxTotal: number;
  isSelected: boolean;
  hasSelection: boolean;
  onPress: () => void;
}

function BarraLugar({ item, index, maxTotal, isSelected, hasSelection, onPress }: BarraProps) {
  const { colors } = useTheme();
  const [containerW, setContainerW] = useState(0);
  const widthSV = useSharedValue(0);
  const opacidadSV = useSharedValue(1);
  const escalaSV = useSharedValue(1);

  const porcentaje = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;

  useEffect(() => {
    if (containerW > 0) {
      widthSV.value = withTiming((containerW * porcentaje) / 100, {
        duration: 550 + index * 55,
      });
    }
  }, [containerW, porcentaje]);

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
  const color = colors.primary;

  return (
    <Animated.View style={rowStyle}>
      <Pressable onPress={onPress} style={styles.fila} hitSlop={4}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text
            style={[styles.label, isSelected && { color: colors.text, fontWeight: '700' }]}
            numberOfLines={1}
          >
            {truncarTexto(item.lugar, 16)}
          </Text>
          <Text style={[styles.valor, isSelected && { color }]}>
            {formatMonto(item.total, true)}
          </Text>
          <Text style={styles.pct}>{porcentaje.toFixed(1)}%</Text>
        </View>
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
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 0 },
                elevation: isSelected ? 3 : 0,
              },
              barStyle,
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface Props {
  data: GastoPorLugar[];
  width: number;
  lugarSeleccionado?: string | null;
  onLugarSeleccionado?: (lugar: string | null) => void;
}

export function TopLugaresChart({ data, width, lugarSeleccionado, onLugarSeleccionado }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin datos disponibles</Text>
      </View>
    );
  }

  const maxTotal = data[0]?.total ?? 1;
  const hasSelection = lugarSeleccionado != null;

  const handlePress = (lugar: string) => {
    onLugarSeleccionado?.(lugarSeleccionado === lugar ? null : lugar);
  };

  return (
    <View style={{ gap: 10 }}>
      {data.map((item, i) => (
        <BarraLugar
          key={item.lugar}
          item={item}
          index={i}
          maxTotal={maxTotal}
          isSelected={lugarSeleccionado === item.lugar}
          hasSelection={hasSelection}
          onPress={() => handlePress(item.lugar)}
        />
      ))}
      <Text style={styles.hint}>Toca un establecimiento para filtrar</Text>
    </View>
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    fila: { gap: 4 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    label: { flex: 1, color: c.textSecondary, fontSize: 12 },
    valor: { color: c.text, fontSize: 12, fontWeight: '600', marginRight: 4 },
    pct: { color: c.textMuted, fontSize: 11, minWidth: 36, textAlign: 'right' },
    barraFondo: { height: 6, backgroundColor: c.border, borderRadius: 3, overflow: 'hidden' },
    barraRelleno: { height: '100%', borderRadius: 3 },
    hint: { color: c.textMuted, fontSize: 10, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
    empty: { alignItems: 'center', paddingVertical: 24 },
    emptyText: { color: c.textMuted, fontSize: 14 },
  });
}
