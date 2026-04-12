import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ExpenseConfirmModal } from '@/components/ExpenseConfirmModal';
import { Toast, ToastType } from '@/components/Toast';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useExpenseStore } from '@/store/expenseStore';
import { verificarPresupuesto, notificarGastoRegistrado } from '@/services/notificaciones';
import type { GastoInput } from '@/types';

const EJEMPLOS = [
  '"Gasté 450 pesos en gasolina con la tarjeta BBVA hoy"',
  '"Compra en Oxxo por 85 pesos con tarjeta NU"',
  '"Almuerzo en el restaurante La Paloma, 320 pesos en efectivo el viernes"',
  '"Netflix 219 pesos con Banamex"',
];

export default function VozScreen() {
  const { colors } = useTheme();
  const { estado, transcripcion, datosParseados, duracion, error, iniciarGrabacion, detenerGrabacion, cancelarGrabacion, reiniciar } =
    useVoiceRecording();
  const { agregarGasto, getKPIs } = useExpenseStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; mensaje: string; tipo: ToastType }>({
    visible: false, mensaje: '', tipo: 'success',
  });

  const mostrarToast = (mensaje: string, tipo: ToastType = 'success') => {
    setToast({ visible: true, mensaje, tipo });
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Abrir modal cuando hay datos listos
  React.useEffect(() => {
    if (estado === 'listo' && datosParseados) {
      setModalVisible(true);
    }
  }, [estado, datosParseados]);

  const handleConfirmar = async (gasto: GastoInput) => {
    setGuardando(true);
    try {
      await agregarGasto(gasto);
      setModalVisible(false);
      reiniciar();

      // Notificaciones
      await notificarGastoRegistrado(gasto.lugar, gasto.monto);
      const kpis = getKPIs();
      await verificarPresupuesto(kpis.gastoMesActual);

      mostrarToast(`$${gasto.monto.toLocaleString('es-MX')} en ${gasto.lugar}`);
    } catch (e) {
      mostrarToast((e as Error).message, 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Registrar gasto</Text>
          <Text style={styles.subtitulo}>
            Habla naturalmente y la IA extraerá los datos automáticamente
          </Text>
        </View>

        {/* Grabador */}
        <View style={styles.grabadorCard}>
          <VoiceRecorder
            estado={estado}
            duracion={duracion}
            onIniciar={iniciarGrabacion}
            onDetener={detenerGrabacion}
            onCancelar={cancelarGrabacion}
            onReiniciar={reiniciar}
          />
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcono}>⚠️</Text>
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        )}

        {/* Ejemplos */}
        <View style={styles.ejemplosCard}>
          <Text style={styles.ejemplosTitulo}>💡 Ejemplos de comandos</Text>
          {EJEMPLOS.map((ejemplo, i) => (
            <View key={i} style={styles.ejemploItem}>
              <View style={styles.ejemploDot} />
              <Text style={styles.ejemploTexto}>{ejemplo}</Text>
            </View>
          ))}
        </View>

        {/* Info de la IA */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitulo}>🤖 Cómo funciona</Text>
          <View style={styles.pasos}>
            {[
              ['1', 'Graba tu mensaje de voz'],
              ['2', 'Whisper AI transcribe el audio'],
              ['3', 'GPT-4 extrae los datos del gasto'],
              ['4', 'Confirma y guarda en la nube'],
            ].map(([num, texto]) => (
              <View key={num} style={styles.paso}>
                <View style={styles.pasoBadge}>
                  <Text style={styles.pasoNum}>{num}</Text>
                </View>
                <Text style={styles.pasoTexto}>{texto}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Toast de confirmación */}
      <Toast
        visible={toast.visible}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onOcultar={() => setToast((t) => ({ ...t, visible: false }))}
      />

      {/* Modal de confirmación */}
      <ExpenseConfirmModal
        visible={modalVisible}
        datos={datosParseados}
        transcripcion={transcripcion}
        onConfirmar={handleConfirmar}
        onCancelar={() => {
          setModalVisible(false);
          reiniciar();
        }}
        guardando={guardando}
      />
    </SafeAreaView>
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    contenido: {
      padding: 16,
      gap: 16,
      paddingBottom: 32,
    },
    header: {
      gap: 6,
    },
    titulo: {
      color: c.text,
      fontSize: 24,
      fontWeight: '800',
    },
    subtitulo: {
      color: c.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    grabadorCard: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 8,
    },
    errorCard: {
      backgroundColor: `${c.danger}18`,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: `${c.danger}44`,
    },
    errorIcono: {
      fontSize: 20,
    },
    errorTexto: {
      color: c.danger,
      fontSize: 13,
      flex: 1,
    },
    ejemplosCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      gap: 10,
    },
    ejemplosTitulo: {
      color: c.text,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 2,
    },
    ejemploItem: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'flex-start',
    },
    ejemploDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.primary,
      marginTop: 6,
    },
    ejemploTexto: {
      color: c.textSecondary,
      fontSize: 13,
      flex: 1,
      lineHeight: 19,
      fontStyle: 'italic',
    },
    infoCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    infoTitulo: {
      color: c.text,
      fontSize: 14,
      fontWeight: '700',
    },
    pasos: {
      gap: 10,
    },
    paso: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    pasoBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: `${c.primary}33`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pasoNum: {
      color: c.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    pasoTexto: {
      color: c.textSecondary,
      fontSize: 13,
      flex: 1,
    },
  });
}
