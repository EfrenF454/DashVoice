import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { formatMonto } from '@/utils/formatters';
import type { GastoPorTarjeta } from '@/types';

interface FilaProps {
  item: GastoPorTarjeta;
  maxTotal: number;
  isSelected: boolean;
  hasSelection: boolean;
  onPress: () => void;
}

function TarjetaFila({ item, maxTotal, isSelected, hasSelection, onPress }: FilaProps) {
  const { colors } = useTheme();
  const [containerW, setContainerW] = useState(0);
  const widthSV = useSharedValue(0);
  const opacidadSV = useSharedValue(1);
  const escalaSV = useSharedValue(1);

  const targetPercent = maxTotal > 0 ? item.total / maxTotal : 0;

  useEffect(() => {
    if (containerW > 0) {
      widthSV.value = withTiming(containerW * targetPercent, { duration: 600 });
    }
  }, [containerW, targetPercent]);

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
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.tarjetaNombre}>{item.tarjeta}</Text>
          {isSelected && <Text style={[styles.selectedMark, { color: colors.primary }]}>●</Text>}
        </View>

        <View style={styles.barraContainer}>
          <View
            style={styles.barraFondo}
            onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
          >
            <Animated.View
              style={[
                styles.barraRelleno,
                {
                  shadowOpacity: isSelected ? 0.5 : 0,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: isSelected ? 4 : 0,
                },
                barStyle,
              ]}
            />
          </View>
          <Text style={styles.monto}>{formatMonto(item.total)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface Props {
  data: GastoPorTarjeta[];
  tarjetaSeleccionada?: string | null;
  onTarjetaSeleccionada?: (tarjeta: string | null) => void;
}

export function TarjetasChart({ data, tarjetaSeleccionada, onTarjetaSeleccionada }: Props) {
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
  const hasSelection = tarjetaSeleccionada != null;

  const handlePress = (tarjeta: string) => {
    onTarjetaSeleccionada?.(tarjetaSeleccionada === tarjeta ? null : tarjeta);
  };

  return (
    <View style={styles.container}>
      {data.map((item) => (
        <TarjetaFila
          key={item.tarjeta}
          item={item}
          maxTotal={maxTotal}
          isSelected={tarjetaSeleccionada === item.tarjeta}
          hasSelection={hasSelection}
          onPress={() => handlePress(item.tarjeta)}
        />
      ))}
      <Text style={styles.hint}>Toca una tarjeta para filtrar</Text>
    </View>
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: { gap: 12 },
    empty: { alignItems: 'center', paddingVertical: 24 },
    emptyText: { color: c.textMuted, fontSize: 14 },
    fila: { gap: 8 },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 6,
      backgroundColor: `${c.primary}22`,
    },
    badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary },
    tarjetaNombre: { fontSize: 13, fontWeight: '600', color: c.text },
    selectedMark: { fontSize: 8 },
    barraContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    barraFondo: { flex: 1, height: 10, backgroundColor: c.border, borderRadius: 4, overflow: 'hidden' },
    barraRelleno: { height: '100%', borderRadius: 4, backgroundColor: c.primary, shadowColor: c.primary },
    monto: { color: c.text, fontSize: 13, fontWeight: '600', minWidth: 80, textAlign: 'right' },
    hint: { color: c.textMuted, fontSize: 10, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
  });
}
