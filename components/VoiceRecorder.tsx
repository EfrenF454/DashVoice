import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { EstadoGrabacion } from '@/hooks/useVoiceRecording';

interface Props {
  estado: EstadoGrabacion;
  duracion: number;
  onIniciar: () => void;
  onDetener: () => void;
  onCancelar: () => void;
  onReiniciar: () => void;
}

function formatDuracion(seg: number): string {
  const m = Math.floor(seg / 60)
    .toString()
    .padStart(2, '0');
  const s = (seg % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function VoiceRecorder({ estado, duracion, onIniciar, onDetener, onCancelar, onReiniciar }: Props) {
  const { colors } = useTheme();
  const pulso = useRef(new Animated.Value(1)).current;
  const opacidad = useRef(new Animated.Value(1)).current;

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (estado === 'grabando') {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulso, { toValue: 1.25, duration: 700, useNativeDriver: true }),
            Animated.timing(opacidad, { toValue: 0.4, duration: 700, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulso, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.timing(opacidad, { toValue: 1, duration: 700, useNativeDriver: true }),
          ]),
        ])
      ).start();
    } else {
      pulso.setValue(1);
      opacidad.setValue(1);
    }
  }, [estado]);

  const estaGrabando = estado === 'grabando';
  const estaProcesando = estado === 'procesando';

  const colorBoton =
    estado === 'grabando' ? colors.danger : estado === 'listo' ? colors.success : colors.primary;

  return (
    <View style={styles.container}>
      {/* Anillo pulsante */}
      <Animated.View
        style={[
          styles.anillo,
          {
            borderColor: colorBoton,
            transform: [{ scale: pulso }],
            opacity: estaGrabando ? opacidad : 0,
          },
        ]}
      />

      {/* Botón principal */}
      <TouchableOpacity
        style={[styles.boton, { backgroundColor: colorBoton }]}
        onPress={estaGrabando ? onDetener : onIniciar}
        disabled={estaProcesando}
        activeOpacity={0.85}
      >
        {estaProcesando ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.botonIcono}>
            {estaGrabando ? '⏹' : estado === 'listo' ? '✓' : '🎤'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Duración */}
      {(estaGrabando || estaProcesando) && (
        <Text style={styles.duracion}>
          {estaProcesando ? 'Procesando…' : formatDuracion(duracion)}
        </Text>
      )}

      {/* Instrucción */}
      <Text style={styles.instruccion}>
        {estado === 'idle' && 'Toca para grabar tu gasto'}
        {estado === 'grabando' && 'Grabando… toca para detener'}
        {estado === 'procesando' && 'Analizando con IA…'}
        {estado === 'listo' && 'Gasto detectado. Confirma abajo.'}
        {estado === 'error' && 'Ocurrió un error. Intenta de nuevo.'}
      </Text>

      {/* Botón cancelar (solo mientras graba) */}
      {estaGrabando && (
        <TouchableOpacity style={styles.cancelarBtn} onPress={onCancelar}>
          <Text style={styles.cancelarTexto}>✕  Cancelar</Text>
        </TouchableOpacity>
      )}

      {/* Botón reiniciar */}
      {(estado === 'listo' || estado === 'error') && (
        <TouchableOpacity style={styles.reiniciarBtn} onPress={onReiniciar}>
          <Text style={styles.reiniciarTexto}>↺  Grabar de nuevo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 16,
      paddingVertical: 24,
    },
    anillo: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      top: 16,
    },
    boton: {
      width: 84,
      height: 84,
      borderRadius: 42,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
    },
    botonIcono: {
      fontSize: 32,
    },
    duracion: {
      color: c.text,
      fontSize: 22,
      fontWeight: '600',
      letterSpacing: 2,
      fontVariant: ['tabular-nums'],
    },
    instruccion: {
      color: c.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
    cancelarBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: `${c.danger}66`,
      backgroundColor: `${c.danger}18`,
    },
    cancelarTexto: {
      color: c.danger,
      fontSize: 14,
      fontWeight: '600',
    },
    reiniciarBtn: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
    },
    reiniciarTexto: {
      color: c.textSecondary,
      fontSize: 14,
    },
  });
}
