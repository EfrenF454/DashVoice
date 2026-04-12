import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { procesarAudioGasto } from '@/services/openai';
import type { ParsedExpenseResponse } from '@/types';

export type EstadoGrabacion = 'idle' | 'grabando' | 'procesando' | 'listo' | 'error';

const DURACION_MINIMA = 3; // segundos

interface UseVoiceRecordingReturn {
  estado: EstadoGrabacion;
  transcripcion: string | null;
  datosParseados: ParsedExpenseResponse | null;
  duracion: number;
  error: string | null;
  iniciarGrabacion: () => Promise<void>;
  detenerGrabacion: () => Promise<void>;
  cancelarGrabacion: () => Promise<void>;
  reiniciar: () => void;
}

export function useVoiceRecording(): UseVoiceRecordingReturn {
  const [estado, setEstado] = useState<EstadoGrabacion>('idle');
  const [transcripcion, setTranscripcion] = useState<string | null>(null);
  const [datosParseados, setDatosParseados] = useState<ParsedExpenseResponse | null>(null);
  const [duracion, setDuracion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const grabacionRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const duracionRef = useRef(0);

  const iniciarGrabacion = useCallback(async () => {
    try {
      setError(null);
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setError('Se necesita permiso de micrófono para grabar audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const grabacion = new Audio.Recording();
      await grabacion.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        },
      });

      await grabacion.startAsync();
      grabacionRef.current = grabacion;

      setDuracion(0);
      duracionRef.current = 0;
      setEstado('grabando');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      timerRef.current = setInterval(() => {
        setDuracion((d) => {
          duracionRef.current = d + 1;
          return d + 1;
        });
      }, 1000);
    } catch (e) {
      setError(`Error al iniciar grabación: ${(e as Error).message}`);
      setEstado('error');
    }
  }, []);

  const detenerGrabacion = useCallback(async () => {
    if (!grabacionRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Ignorar audios demasiado cortos
    if (duracionRef.current <= DURACION_MINIMA) {
      try { await grabacionRef.current.stopAndUnloadAsync(); } catch {}
      grabacionRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
      setDuracion(0);
      duracionRef.current = 0;
      setError(`Audio muy corto. Graba al menos ${DURACION_MINIMA + 1} segundos.`);
      setEstado('error');
      return;
    }

    setEstado('procesando');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await grabacionRef.current.stopAndUnloadAsync();
      const uri = grabacionRef.current.getURI();
      grabacionRef.current = null;

      if (!uri) throw new Error('No se pudo obtener el archivo de audio.');

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const { transcripcion: texto, datos } = await procesarAudioGasto(uri);
      setTranscripcion(texto);
      setDatosParseados(datos);
      setEstado('listo');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setError(`Error al procesar audio: ${(e as Error).message}`);
      setEstado('error');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  const cancelarGrabacion = useCallback(async () => {
    if (!grabacionRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try { await grabacionRef.current.stopAndUnloadAsync(); } catch {}
    grabacionRef.current = null;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});

    setEstado('idle');
    setDuracion(0);
    duracionRef.current = 0;
    setError(null);
    setTranscripcion(null);
    setDatosParseados(null);
  }, []);

  const reiniciar = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    grabacionRef.current = null;
    setEstado('idle');
    setTranscripcion(null);
    setDatosParseados(null);
    setDuracion(0);
    setError(null);
  }, []);

  return {
    estado,
    transcripcion,
    datosParseados,
    duracion,
    error,
    iniciarGrabacion,
    detenerGrabacion,
    cancelarGrabacion,
    reiniciar,
  };
}
