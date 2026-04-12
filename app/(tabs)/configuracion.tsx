import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { THEME_META, ThemeName } from '@/constants/themes';
import { guardarPresupuesto, obtenerPresupuesto } from '@/services/supabase';
import { formatMonto } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext';

const VERSION = '1.0.0';
const TEMAS: ThemeName[] = ['default', 'dark', 'claro', 'neon'];

export default function ConfiguracionScreen() {
  const { colors, themeName, setTheme } = useTheme();
  const { user, cerrarSesion } = useAuth();
  const [presupuesto, setPresupuesto] = useState('10000');
  const [alertas, setAlertas] = useState(true);
  const [porcentajeAlerta, setPorcentajeAlerta] = useState('80');

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => { cargarConfig(); }, []);

  const cargarConfig = async () => {
    const p = await obtenerPresupuesto();
    setPresupuesto(p.toString());
    const alertasGuardadas = await AsyncStorage.getItem('alertas_activas');
    if (alertasGuardadas !== null) setAlertas(alertasGuardadas === 'true');
    const pct = await AsyncStorage.getItem('porcentaje_alerta');
    if (pct) setPorcentajeAlerta(pct);
  };

  // Auto-guardar presupuesto al terminar de editar
  const guardarPresupuestoAuto = async () => {
    const montoNum = Number(presupuesto);
    if (!montoNum || montoNum <= 0) return;
    try { await guardarPresupuesto(montoNum); } catch {}
  };

  // Auto-guardar alertas al cambiar
  const cambiarAlertas = async (valor: boolean) => {
    setAlertas(valor);
    await AsyncStorage.setItem('alertas_activas', valor.toString());
  };

  const cambiarPorcentaje = async (pct: string) => {
    setPorcentajeAlerta(pct);
    await AsyncStorage.setItem('porcentaje_alerta', pct);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Configuración</Text>

        {/* Tema visual */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>🎨 Tema visual</Text>
          <View style={styles.temasGrid}>
            {TEMAS.map((id) => {
              const meta = THEME_META[id];
              const activo = themeName === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.temaCard, activo && styles.temaCardActivo]}
                  onPress={() => setTheme(id)}
                  activeOpacity={0.75}
                >
                  {/* Preview de colores */}
                  <View style={styles.temaPreview}>
                    <View style={[styles.temaCirculo, { backgroundColor: meta.preview[0], borderWidth: 1, borderColor: colors.border }]} />
                    <View style={[styles.temaCirculo, { backgroundColor: meta.preview[1], borderWidth: 1, borderColor: colors.border }]} />
                    <View style={[styles.temaCirculo, { backgroundColor: meta.preview[2] }]} />
                  </View>
                  <Text style={[styles.temaLabel, activo && { color: colors.primary, fontWeight: '700' }]}>
                    {meta.label}
                  </Text>
                  {activo && (
                    <View style={[styles.temaCheck, { backgroundColor: colors.primary }]}>
                      <Text style={styles.temaCheckTexto}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Presupuesto */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>💰 Presupuesto mensual</Text>
          <Text style={styles.seccionDesc}>
            Define cuánto planeas gastar cada mes. Recibirás alertas cuando te acerques al límite.
          </Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputPrefijo}>$</Text>
            <TextInput
              style={styles.input}
              value={presupuesto}
              onChangeText={setPresupuesto}
              onBlur={guardarPresupuestoAuto}
              keyboardType="numeric"
              placeholder="10000"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
            />
          </View>
          <Text style={styles.presupuestoHelper}>
            Presupuesto actual: {formatMonto(Number(presupuesto) || 0)}
          </Text>
        </View>

        {/* Alertas */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>🔔 Notificaciones</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchTextos}>
              <Text style={styles.switchLabel}>Alertas de presupuesto</Text>
              <Text style={styles.switchDesc}>Notificar cuando te acerques al límite</Text>
            </View>
            <Switch
              value={alertas}
              onValueChange={cambiarAlertas}
              trackColor={{ false: colors.border, true: `${colors.primary}66` }}
              thumbColor={alertas ? colors.primary : colors.textMuted}
            />
          </View>
          {alertas && (
            <View style={styles.campo}>
              <Text style={styles.campoLabel}>Alertar al alcanzar el</Text>
              <View style={styles.pctRow}>
                {['70', '80', '90', '95'].map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    style={[styles.pctChip, porcentajeAlerta === pct && styles.pctChipActivo]}
                    onPress={() => cambiarPorcentaje(pct)}
                  >
                    <Text style={[styles.pctChipTexto, porcentajeAlerta === pct && styles.pctChipTextoActivo]}>
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Cuenta */}
        {user && (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>👤 Cuenta</Text>
            <View style={styles.cuentaRow}>
              <Text style={styles.cuentaEmail} numberOfLines={1}>{user.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.btnCerrarSesion}
              onPress={() =>
                Alert.alert(
                  'Cerrar sesión',
                  '¿Estás seguro de que quieres cerrar sesión?',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
                  ],
                )
              }
            >
              <Text style={styles.btnCerrarSesionTexto}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Acerca de */}
        <View style={styles.acercaDe}>
          <Text style={styles.acercaDeTexto}>App Gastos v{VERSION}</Text>
          <Text style={styles.acercaDeTexto}>Powered by Gemini 2.5 Flash</Text>
          <Text style={styles.acercaDeTexto}>Almacenamiento: Supabase</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    contenido: { padding: 16, gap: 16, paddingBottom: 40 },
    titulo: { color: c.text, fontSize: 24, fontWeight: '800' },
    seccion: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: c.border,
      ...c.cardGlow,
    },
    seccionTitulo: { color: c.text, fontSize: 16, fontWeight: '700' },
    seccionDesc: { color: c.textSecondary, fontSize: 13, lineHeight: 19 },

    // ── Temas ──────────────────────────────────────────────────────────────────
    temasGrid: { flexDirection: 'row', gap: 10 },
    temaCard: {
      flex: 1,
      backgroundColor: c.surfaceLight,
      borderRadius: 14,
      padding: 12,
      alignItems: 'center',
      gap: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    temaCardActivo: {
      borderColor: c.primary,
      backgroundColor: `${c.primary}12`,
    },
    temaPreview: { flexDirection: 'row', gap: 4 },
    temaCirculo: { width: 14, height: 14, borderRadius: 7 },
    temaLabel: { color: c.textSecondary, fontSize: 12, fontWeight: '500' },
    temaCheck: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    temaCheckTexto: { color: '#fff', fontSize: 9, fontWeight: '900' },

    // ── Presupuesto ────────────────────────────────────────────────────────────
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceLight,
      borderRadius: 10,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    inputPrefijo: { color: c.textSecondary, fontSize: 18, marginRight: 4 },
    input: { flex: 1, color: c.text, fontSize: 20, fontWeight: '600', paddingVertical: 12 },
    presupuestoHelper: { color: c.textMuted, fontSize: 12 },

    // ── Alertas ────────────────────────────────────────────────────────────────
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    switchTextos: { flex: 1, marginRight: 12 },
    switchLabel: { color: c.text, fontSize: 14, fontWeight: '500' },
    switchDesc: { color: c.textMuted, fontSize: 12, marginTop: 2 },
    campo: { gap: 8 },
    campoLabel: { color: c.textSecondary, fontSize: 13 },
    pctRow: { flexDirection: 'row', gap: 8 },
    pctChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: c.surfaceLight,
      borderWidth: 1,
      borderColor: c.border,
    },
    pctChipActivo: { backgroundColor: c.primary, borderColor: c.primary },
    pctChipTexto: { color: c.textSecondary, fontSize: 14, fontWeight: '500' },
    pctChipTextoActivo: { color: '#fff', fontWeight: '700' },

    // ── Cuenta ─────────────────────────────────────────────────────────────────
    cuentaRow: {
      backgroundColor: c.surfaceLight,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    cuentaEmail: { color: c.textSecondary, fontSize: 14 },
    btnCerrarSesion: {
      backgroundColor: `${c.danger}18`,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${c.danger}44`,
    },
    btnCerrarSesionTexto: { color: c.danger, fontSize: 15, fontWeight: '700' },

    // ── Acerca de ──────────────────────────────────────────────────────────────
    acercaDe: { alignItems: 'center', gap: 4, paddingVertical: 8 },
    acercaDeTexto: { color: c.textMuted, fontSize: 12 },
  });
}
