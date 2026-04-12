import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { formatMonto, formatPorcentaje } from '@/utils/formatters';

// ── Hook: contador animado de número ────────────────────────────────────────
function useContadorAnimado(target: number, duracion = 550): number {
  const [valor, setValor] = useState(target);
  const valorActualRef = useRef(target);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const inicio = valorActualRef.current;
    const fin = target;

    if (Math.abs(inicio - fin) < 0.5) {
      setValor(fin);
      valorActualRef.current = fin;
      return;
    }

    const startTime = Date.now();
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duracion, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = inicio + (fin - inicio) * eased;
      setValor(current);
      valorActualRef.current = current;
      if (progress >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setValor(fin);
        valorActualRef.current = fin;
      }
    }, 16);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [target, duracion]);

  return valor;
}

// ── Componente ───────────────────────────────────────────────────────────────

interface KPICardProps {
  titulo: string;
  valor: number;
  subtitulo?: string;
  variacion?: number;
  diferencia?: number;
  color?: string;
  colorValor?: string;
  icono?: string;
  resaltado?: boolean;
}

export function KPICard({
  titulo,
  valor,
  subtitulo,
  variacion,
  diferencia,
  color,
  colorValor,
  icono,
  resaltado = false,
}: KPICardProps) {
  const { colors } = useTheme();
  const accentColor = color ?? colors.primary;
  const valorColor = colorValor ?? accentColor;

  const valorAnimado = useContadorAnimado(valor);
  const escalaSV = useSharedValue(1);
  const prevValorRef = useRef(valor);

  useEffect(() => {
    if (prevValorRef.current !== valor) {
      escalaSV.value = withTiming(1.025, { duration: 120 }, () => {
        escalaSV.value = withTiming(1, { duration: 200 });
      });
      prevValorRef.current = valor;
    }
  }, [valor]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: escalaSV.value }],
  }));

  const styles = useMemo(() => createStyles(colors), [colors]);
  const esPositivo = (variacion ?? 0) >= 0;

  return (
    <Animated.View
      style={[
        styles.card,
        { borderLeftColor: accentColor },
        resaltado && [styles.cardResaltado, { shadowColor: accentColor }, colors.cardGlow],
        animStyle,
      ]}
    >
      <View style={styles.header}>
        {icono && <Text style={styles.icono}>{icono}</Text>}
        <Text style={styles.titulo} numberOfLines={1}>{titulo}</Text>
        {resaltado && (
          <View style={[styles.activoBadge, { backgroundColor: `${accentColor}33` }]}>
            <Text style={[styles.activoTexto, { color: accentColor }]}>●</Text>
          </View>
        )}
      </View>

      <Text style={[styles.valor, { color: valorColor }]}>{formatMonto(valorAnimado)}</Text>

      {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}

      {variacion !== undefined && (
        <View style={styles.variacionRow}>
          <View style={[
            styles.variacionBadge,
            { backgroundColor: esPositivo ? `${colors.danger}22` : `${colors.success}22` },
          ]}>
            <Text style={[styles.variacionTexto, { color: esPositivo ? colors.danger : colors.success }]}>
              {esPositivo ? '▲' : '▼'} {formatPorcentaje(Math.abs(variacion))}
            </Text>
          </View>
          {diferencia !== undefined && (
            <Text style={styles.diferenciaTexto}>
              {diferencia >= 0 ? '+' : ''}{formatMonto(diferencia, true)} vs ant.
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderRadius: 14,
      padding: 16,
      borderLeftWidth: 4,
      gap: 4,
      flex: 1,
      minWidth: 150,
    },
    cardResaltado: {
      backgroundColor: c.surfaceLight,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    icono: { fontSize: 16 },
    titulo: { color: c.textSecondary, fontSize: 12, fontWeight: '500', flex: 1 },
    activoBadge: { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
    activoTexto: { fontSize: 8 },
    valor: { fontSize: 22, fontWeight: '700', marginTop: 4 },
    subtitulo: { color: c.textMuted, fontSize: 11 },
    variacionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
    variacionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    variacionTexto: { fontSize: 11, fontWeight: '600' },
    diferenciaTexto: { color: c.textMuted, fontSize: 10 },
  });
}
