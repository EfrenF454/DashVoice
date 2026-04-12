import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { CONCEPTOS, TARJETAS } from '@/constants/Categories';
import { formatMonto } from '@/utils/formatters';
import type { GastoInput, ParsedExpenseResponse } from '@/types';

interface Props {
  visible: boolean;
  datos: ParsedExpenseResponse | null;
  transcripcion: string | null;
  onConfirmar: (gasto: GastoInput) => void;
  onCancelar: () => void;
  guardando?: boolean;
}

export function ExpenseConfirmModal({
  visible,
  datos,
  transcripcion,
  onConfirmar,
  onCancelar,
  guardando = false,
}: Props) {
  const { colors } = useTheme();
  const [tarjeta, setTarjeta] = useState(datos?.tarjeta ?? '');
  const [lugar, setLugar] = useState(datos?.lugar ?? '');
  const [concepto, setConcepto] = useState(datos?.concepto ?? '');
  const [monto, setMonto] = useState(datos?.monto?.toString() ?? '');
  const [fecha, setFecha] = useState(datos?.fecha ?? '');

  const styles = useMemo(() => createStyles(colors), [colors]);

  React.useEffect(() => {
    if (datos) {
      setTarjeta(datos.tarjeta.toUpperCase());
      setLugar(datos.lugar.toUpperCase());
      setConcepto(datos.concepto.toUpperCase());
      setMonto(datos.monto.toString());
      setFecha(datos.fecha);
    }
  }, [datos]);

  const handleConfirmar = () => {
    onConfirmar({
      tarjeta,
      lugar,
      concepto,
      monto: Number(monto),
      fecha,
      audio_transcripcion: transcripcion ?? undefined,
    });
  };

  const campoValido = tarjeta && lugar && concepto && Number(monto) > 0 && fecha;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.handle} />

          <Text style={styles.titulo}>Confirmar gasto</Text>

          {transcripcion && (
            <View style={styles.transcripcionBox}>
              <Text style={styles.transcripcionLabel}>Texto detectado</Text>
              <Text style={styles.transcripcionTexto} numberOfLines={3}>
                "{transcripcion}"
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
            <Campo label="Monto" valor={monto} onCambiar={setMonto} teclado="numeric" placeholder="0" prefijo="$" />
            <Campo label="Tarjeta" valor={tarjeta} onCambiar={setTarjeta} placeholder="NU, BBVA…" />
            <Campo label="Lugar" valor={lugar} onCambiar={setLugar} placeholder="Oxxo, Costco…" />
            <Campo label="Concepto" valor={concepto} onCambiar={setConcepto} placeholder="Gasolina, Comida…" />
            <Campo label="Fecha" valor={fecha} onCambiar={setFecha} placeholder="YYYY-MM-DD" />

            {/* Atajos de concepto */}
            <Text style={styles.atajosLabel}>Conceptos rápidos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.atajos}>
              {CONCEPTOS.slice(0, 10).map((c) => {
                const cu = c.toUpperCase();
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.atajoBadge,
                      concepto === cu && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setConcepto(cu)}
                  >
                    <Text style={[styles.atajoTexto, concepto === cu && { color: '#fff' }]}>{cu}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ScrollView>

          <View style={styles.botonesRow}>
            <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
              <Text style={styles.btnCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnConfirmar, !campoValido && styles.btnDesactivado]}
              onPress={handleConfirmar}
              disabled={!campoValido || guardando}
            >
              <Text style={styles.btnConfirmarTexto}>
                {guardando ? 'Guardando…' : `Guardar ${formatMonto(Number(monto))}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Campo({
  label,
  valor,
  onCambiar,
  teclado = 'default',
  placeholder,
  prefijo,
}: {
  label: string;
  valor: string;
  onCambiar: (v: string) => void;
  teclado?: 'default' | 'numeric';
  placeholder?: string;
  prefijo?: string;
}) {
  const { colors } = useTheme();
  const campoStyles = useMemo(() => createCampoStyles(colors), [colors]);

  return (
    <View style={campoStyles.container}>
      <Text style={campoStyles.label}>{label}</Text>
      <View style={campoStyles.inputRow}>
        {prefijo && <Text style={campoStyles.prefijo}>{prefijo}</Text>}
        <TextInput
          style={campoStyles.input}
          value={valor}
          onChangeText={(v) => onCambiar(v.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))}
          keyboardType={teclado}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
        />
      </View>
    </View>
  );
}

function createCampoStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      marginBottom: 14,
    },
    label: {
      color: c.textSecondary,
      fontSize: 12,
      marginBottom: 6,
      fontWeight: '500',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceLight,
      borderRadius: 10,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    prefijo: {
      color: c.textSecondary,
      fontSize: 16,
      marginRight: 4,
    },
    input: {
      flex: 1,
      color: c.text,
      fontSize: 15,
      paddingVertical: 12,
    },
  });
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: c.overlay,
    },
    container: {
      backgroundColor: c.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: '90%',
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: c.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    titulo: {
      color: c.text,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 16,
    },
    transcripcionBox: {
      backgroundColor: c.surfaceLight,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
      borderLeftWidth: 3,
      borderLeftColor: c.primary,
    },
    transcripcionLabel: {
      color: c.textMuted,
      fontSize: 10,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    transcripcionTexto: {
      color: c.textSecondary,
      fontSize: 13,
      fontStyle: 'italic',
    },
    form: {
      marginBottom: 16,
    },
    atajosLabel: {
      color: c.textMuted,
      fontSize: 11,
      marginBottom: 8,
      marginTop: 4,
    },
    atajos: {
      marginBottom: 8,
    },
    atajoBadge: {
      backgroundColor: c.surfaceLight,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    atajoTexto: {
      color: c.textSecondary,
      fontSize: 12,
    },
    botonesRow: {
      flexDirection: 'row',
      gap: 12,
    },
    btnCancelar: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: c.surfaceLight,
    },
    btnCancelarTexto: {
      color: c.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
    btnConfirmar: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: c.primary,
    },
    btnConfirmarTexto: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
    },
    btnDesactivado: {
      opacity: 0.5,
    },
  });
}
