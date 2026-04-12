import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

export type ToastType = 'success' | 'error';

interface ToastProps {
  visible: boolean;
  mensaje: string;
  tipo?: ToastType;
  duracion?: number;
  onOcultar: () => void;
}

export function Toast({ visible, mensaje, tipo = 'success', duracion = 2800, onOcultar }: ToastProps) {
  const { colors } = useTheme();
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (visible) {
      if (timerRef.current) clearTimeout(timerRef.current);

      // Entrada
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 180 });

      // Auto-ocultar
      timerRef.current = setTimeout(() => {
        translateY.value = withTiming(-80, { duration: 280 });
        opacity.value = withTiming(0, { duration: 250 }, (finished) => {
          if (finished) runOnJS(onOcultar)();
        });
      }, duracion);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible, mensaje]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) return null;

  const bgColor = tipo === 'success' ? colors.success : colors.danger;
  const icono = tipo === 'success' ? '✓' : '✕';

  return (
    <Animated.View style={[styles.wrapper, animStyle]} pointerEvents="none">
      <View style={[styles.toast, { backgroundColor: bgColor, shadowColor: bgColor }]}>
        <View style={styles.iconoCirculo}>
          <Text style={styles.icono}>{icono}</Text>
        </View>
        <Text style={styles.texto} numberOfLines={2}>{mensaje}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: 420,
    width: '100%',
  },
  iconoCirculo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icono: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  texto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
