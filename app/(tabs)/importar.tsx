import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';
import { CONCEPTOS, TARJETAS } from '@/constants/Categories';
import { formatMonto } from '@/utils/formatters';
import { crearGasto, crearGastos } from '@/services/supabase';
import { useExpenseStore } from '@/store/expenseStore';
import type { GastoInput } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

const ALIAS_FECHA = ['fecha', 'date', 'día', 'dia'];
const ALIAS_TARJETA = ['tarjeta', 'card', 'banco', 'bank'];
const ALIAS_LUGAR = ['lugar', 'establecimiento', 'comercio', 'store', 'place', 'negocio'];
const ALIAS_CONCEPTO = ['concepto', 'categoria', 'categoría', 'category', 'tipo', 'type'];
const ALIAS_MONTO = ['monto', 'importe', 'cantidad', 'total', 'amount', 'valor'];

function buscarColumna(keys: string[], aliases: string[]): string | null {
  for (const key of keys) {
    if (aliases.includes(key.toLowerCase().trim())) return key;
  }
  return null;
}

function normalizarFecha(raw: unknown): string {
  if (!raw) return format(new Date(), 'yyyy-MM-dd');
  // Número serial de Excel
  if (typeof raw === 'number') {
    const fecha = XLSX.SSF.parse_date_code(raw);
    const m = String(fecha.m).padStart(2, '0');
    const d = String(fecha.d).padStart(2, '0');
    return `${fecha.y}-${m}-${d}`;
  }
  const s = String(raw).trim();
  // DD/MM/YYYY
  const dm = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dm) return `${dm[3]}-${dm[2].padStart(2, '0')}-${dm[1].padStart(2, '0')}`;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return format(new Date(), 'yyyy-MM-dd');
}

function parsearFilas(rows: Record<string, unknown>[]): { gastos: GastoInput[]; errores: number } {
  if (rows.length === 0) return { gastos: [], errores: 0 };
  const keys = Object.keys(rows[0]);

  const colFecha = buscarColumna(keys, ALIAS_FECHA);
  const colTarjeta = buscarColumna(keys, ALIAS_TARJETA);
  const colLugar = buscarColumna(keys, ALIAS_LUGAR);
  const colConcepto = buscarColumna(keys, ALIAS_CONCEPTO);
  const colMonto = buscarColumna(keys, ALIAS_MONTO);

  const gastos: GastoInput[] = [];
  let errores = 0;

  for (const row of rows) {
    const monto = Number(colMonto ? row[colMonto] : 0);
    if (!monto || monto <= 0) { errores++; continue; }

    gastos.push({
      fecha: normalizarFecha(colFecha ? row[colFecha] : null),
      tarjeta: String(colTarjeta ? row[colTarjeta] ?? 'Efectivo' : 'Efectivo').toUpperCase(),
      lugar: String(colLugar ? row[colLugar] ?? 'Sin lugar' : 'Sin lugar').toUpperCase(),
      concepto: String(colConcepto ? row[colConcepto] ?? 'Otro' : 'Otro').toUpperCase(),
      monto,
    });
  }

  return { gastos, errores };
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function ImportarScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<'excel' | 'manual'>('excel');

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Importar gastos</Text>
        <Text style={styles.subtitulo}>Sube tu Excel o agrega un gasto manualmente</Text>
      </View>

      {/* Selector de tab */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'excel' && styles.tabBtnActivo]}
          onPress={() => setTab('excel')}
        >
          <Text style={[styles.tabBtnTexto, tab === 'excel' && styles.tabBtnTextoActivo]}>
            📊 Importar Excel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'manual' && styles.tabBtnActivo]}
          onPress={() => setTab('manual')}
        >
          <Text style={[styles.tabBtnTexto, tab === 'manual' && styles.tabBtnTextoActivo]}>
            ✏️ Agregar manual
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'excel' ? <TabExcel /> : <TabManual />}
    </SafeAreaView>
  );
}

// ── Tab: Importar Excel ───────────────────────────────────────────────────────

function TabExcel() {
  const { colors } = useTheme();
  const { cargarGastos } = useExpenseStore();
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState<GastoInput[] | null>(null);
  const [erroresOmitidos, setErroresOmitidos] = useState(0);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [importando, setImportando] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const seleccionarArchivo = async () => {
    try {
      setCargando(true);
      setPreview(null);

      const resultado = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        copyToCacheDirectory: true,
      });

      if (resultado.canceled) return;

      const archivo = resultado.assets[0];
      setNombreArchivo(archivo.name);

      const base64 = await FileSystem.readAsStringAsync(archivo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const wb = XLSX.read(base64, { type: 'base64' });
      const hoja = wb.Sheets[wb.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja);

      const { gastos, errores } = parsearFilas(filas);
      setPreview(gastos);
      setErroresOmitidos(errores);
    } catch (e) {
      Alert.alert('Error', `No se pudo leer el archivo: ${(e as Error).message}`);
    } finally {
      setCargando(false);
    }
  };

  const confirmarImportacion = async () => {
    if (!preview || preview.length === 0) return;
    setImportando(true);
    try {
      const LOTE = 100;
      let total = 0;
      for (let i = 0; i < preview.length; i += LOTE) {
        const lote = preview.slice(i, i + LOTE);
        total += await crearGastos(lote);
      }
      await cargarGastos();
      setPreview(null);
      setNombreArchivo('');
      Alert.alert('✅ Importación completa', `Se importaron ${total} gastos correctamente.`);
    } catch (e) {
      Alert.alert('Error al importar', (e as Error).message);
    } finally {
      setImportando(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Instrucciones */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>Formato esperado del Excel</Text>
        <Text style={styles.cardSub}>
          La primera fila debe contener los encabezados. Se reconocen automáticamente:
        </Text>
        <View style={styles.columnasList}>
          {[
            ['📅', 'fecha', 'DD/MM/YYYY o YYYY-MM-DD'],
            ['💳', 'tarjeta', 'NU, BBVA, Efectivo…'],
            ['🏪', 'lugar', 'Nombre del establecimiento'],
            ['🏷', 'concepto', 'Gasolina, Comida…'],
            ['💰', 'monto', 'Número sin símbolos'],
          ].map(([emoji, col, desc]) => (
            <View key={col} style={styles.columnaItem}>
              <Text style={styles.columnaEmoji}>{emoji}</Text>
              <View>
                <Text style={styles.columnaNombre}>{col}</Text>
                <Text style={styles.columnaDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Botón seleccionar */}
      <TouchableOpacity
        style={styles.btnSeleccionar}
        onPress={seleccionarArchivo}
        disabled={cargando || importando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.btnSeleccionarIcono}>📂</Text>
            <Text style={styles.btnSeleccionarTexto}>
              {nombreArchivo || 'Seleccionar archivo Excel'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Preview */}
      {preview && preview.length > 0 && (
        <View style={styles.card}>
          <View style={styles.previewHeader}>
            <Text style={styles.cardTitulo}>Vista previa</Text>
            <View style={styles.previewBadges}>
              <View style={[styles.badge, { backgroundColor: `${colors.success}22` }]}>
                <Text style={[styles.badgeTexto, { color: colors.success }]}>
                  {preview.length} válidos
                </Text>
              </View>
              {erroresOmitidos > 0 && (
                <View style={[styles.badge, { backgroundColor: `${colors.danger}22` }]}>
                  <Text style={[styles.badgeTexto, { color: colors.danger }]}>
                    {erroresOmitidos} omitidos
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Tabla preview */}
          <View style={styles.tabla}>
            <View style={[styles.tablaFila, styles.tablaHeader]}>
              <Text style={[styles.tablaCelda, styles.tablaCeldaFecha, styles.tablaHeaderTexto]}>Fecha</Text>
              <Text style={[styles.tablaCelda, styles.tablaCeldaTarjeta, styles.tablaHeaderTexto]}>Tarjeta</Text>
              <Text style={[styles.tablaCelda, { flex: 2 }, styles.tablaHeaderTexto]}>Lugar</Text>
              <Text style={[styles.tablaCelda, styles.tablaCeldaMonto, styles.tablaHeaderTexto]}>Monto</Text>
            </View>
            {preview.slice(0, 8).map((g, i) => (
              <View key={i} style={[styles.tablaFila, i % 2 === 0 && styles.tablaFilaPar]}>
                <Text style={[styles.tablaCelda, styles.tablaCeldaFecha]} numberOfLines={1}>
                  {g.fecha}
                </Text>
                <Text style={[styles.tablaCelda, styles.tablaCeldaTarjeta]} numberOfLines={1}>
                  {g.tarjeta}
                </Text>
                <Text style={[styles.tablaCelda, { flex: 2 }]} numberOfLines={1}>
                  {g.lugar}
                </Text>
                <Text style={[styles.tablaCelda, styles.tablaCeldaMonto]}>
                  {formatMonto(g.monto, true)}
                </Text>
              </View>
            ))}
            {preview.length > 8 && (
              <Text style={styles.masFilas}>… y {preview.length - 8} registros más</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.btnImportar, importando && { opacity: 0.6 }]}
            onPress={confirmarImportacion}
            disabled={importando}
          >
            {importando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnImportarTexto}>
                Importar {preview.length} gastos
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setPreview(null); setNombreArchivo(''); }}>
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {preview?.length === 0 && (
        <View style={styles.vacioBanner}>
          <Text style={styles.vacioTexto}>
            No se encontraron filas válidas. Verifica que el archivo tenga los encabezados correctos y valores de monto mayores a 0.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ── Tab: Agregar manual ───────────────────────────────────────────────────────

function TabManual() {
  const { colors } = useTheme();
  const { cargarGastos } = useExpenseStore();
  const hoy = format(new Date(), 'yyyy-MM-dd');

  const [fecha, setFecha] = useState(hoy);
  const [tarjeta, setTarjeta] = useState('');
  const [lugar, setLugar] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [guardando, setGuardando] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const limpiar = () => {
    setFecha(hoy);
    setTarjeta('');
    setLugar('');
    setConcepto('');
    setMonto('');
  };

  const sinTildes = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const actualizar = (setter: (v: string) => void) => (v: string) =>
    setter(sinTildes(v).toUpperCase());

  const valido = tarjeta && lugar && concepto && Number(monto) > 0 && fecha;

  const guardar = async () => {
    if (!valido) return;
    setGuardando(true);
    try {
      await crearGasto({ fecha, tarjeta, lugar, concepto, monto: Number(monto) });
      await cargarGastos();
      limpiar();
      Alert.alert('✅ Gasto guardado', `${formatMonto(Number(monto))} en ${lugar}`);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <CampoForm
          label="Monto"
          valor={monto}
          onCambiar={setMonto}
          teclado="numeric"
          placeholder="0"
          prefijo="$"
        />
        <CampoForm
          label="Fecha"
          valor={fecha}
          onCambiar={setFecha}
          placeholder="YYYY-MM-DD"
        />
        <CampoForm
          label="Lugar"
          valor={lugar}
          onCambiar={actualizar(setLugar)}
          placeholder="Oxxo, Costco…"
        />
        <CampoForm
          label="Concepto"
          valor={concepto}
          onCambiar={actualizar(setConcepto)}
          placeholder="Gasolina, Comida…"
        />

        {/* Conceptos rápidos */}
        <Text style={styles.atajosLabel}>Conceptos rápidos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.atajosScroll}>
          {CONCEPTOS.map((c) => {
            const cu = c.toUpperCase();
            return (
              <TouchableOpacity
                key={c}
                style={[styles.atajoBadge, concepto === cu && { backgroundColor: colors.primary }]}
                onPress={() => setConcepto(cu)}
              >
                <Text style={[styles.atajoTexto, concepto === cu && { color: '#fff' }]}>{cu}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <CampoForm
          label="Tarjeta"
          valor={tarjeta}
          onCambiar={actualizar(setTarjeta)}
          placeholder="NU, BBVA, Efectivo…"
        />

        {/* Tarjetas rápidas */}
        <Text style={styles.atajosLabel}>Tarjetas rápidas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.atajosScroll}>
          {TARJETAS.map((t) => {
            const tu = t.toUpperCase();
            return (
              <TouchableOpacity
                key={t}
                style={[styles.atajoBadge, tarjeta === tu && { backgroundColor: colors.primary }]}
                onPress={() => setTarjeta(tu)}
              >
                <Text style={[styles.atajoTexto, tarjeta === tu && { color: '#fff' }]}>{tu}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.btnImportar, (!valido || guardando) && { opacity: 0.5 }]}
        onPress={guardar}
        disabled={!valido || guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnImportarTexto}>
            Guardar {monto && Number(monto) > 0 ? formatMonto(Number(monto)) : 'gasto'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Campo de formulario ───────────────────────────────────────────────────────

function CampoForm({
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
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label}</Text>
      <View style={styles.campoInputRow}>
        {prefijo && <Text style={styles.campoPrefijo}>{prefijo}</Text>}
        <TextInput
          style={styles.campoInput}
          value={valor}
          onChangeText={onCambiar}
          keyboardType={teclado}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
        />
      </View>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

function createStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 12,
      gap: 4,
    },
    titulo: {
      color: c.text,
      fontSize: 24,
      fontWeight: '800',
    },
    subtitulo: {
      color: c.textSecondary,
      fontSize: 14,
    },
    tabRow: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 4,
      gap: 4,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 9,
      alignItems: 'center',
    },
    tabBtnActivo: {
      backgroundColor: c.primary,
    },
    tabBtnTexto: {
      color: c.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
    tabBtnTextoActivo: {
      color: '#fff',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 40,
      gap: 16,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    cardTitulo: {
      color: c.text,
      fontSize: 15,
      fontWeight: '700',
    },
    cardSub: {
      color: c.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    columnasList: {
      gap: 10,
      marginTop: 4,
    },
    columnaItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    columnaEmoji: {
      fontSize: 16,
      marginTop: 2,
    },
    columnaNombre: {
      color: c.primary,
      fontSize: 13,
      fontWeight: '700',
    },
    columnaDesc: {
      color: c.textMuted,
      fontSize: 12,
    },
    btnSeleccionar: {
      backgroundColor: c.surfaceLight,
      borderRadius: 14,
      paddingVertical: 18,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderWidth: 1.5,
      borderColor: c.border,
      borderStyle: 'dashed',
    },
    btnSeleccionarIcono: {
      fontSize: 24,
    },
    btnSeleccionarTexto: {
      color: c.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
    },
    previewBadges: {
      flexDirection: 'row',
      gap: 6,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    badgeTexto: {
      fontSize: 12,
      fontWeight: '600',
    },
    tabla: {
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.border,
    },
    tablaHeader: {
      backgroundColor: c.surfaceLight,
    },
    tablaFila: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    tablaFilaPar: {
      backgroundColor: `${c.surfaceLight}66`,
    },
    tablaCelda: {
      flex: 1,
      color: c.textSecondary,
      fontSize: 11,
    },
    tablaCeldaFecha: {
      flex: 1.2,
    },
    tablaCeldaTarjeta: {
      flex: 1,
    },
    tablaCeldaMonto: {
      flex: 1,
      textAlign: 'right',
      color: c.text,
      fontWeight: '600',
    },
    tablaHeaderTexto: {
      color: c.textMuted,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    masFilas: {
      color: c.textMuted,
      fontSize: 11,
      textAlign: 'center',
      padding: 8,
    },
    btnImportar: {
      backgroundColor: c.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
    },
    btnImportarTexto: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    cancelarTexto: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 4,
    },
    vacioBanner: {
      backgroundColor: `${c.warning}18`,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: `${c.warning}44`,
    },
    vacioTexto: {
      color: c.warning,
      fontSize: 13,
      lineHeight: 20,
    },
    // Formulario manual
    campo: {
      gap: 6,
    },
    campoLabel: {
      color: c.textSecondary,
      fontSize: 12,
      fontWeight: '500',
    },
    campoInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surfaceLight,
      borderRadius: 10,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    campoPrefijo: {
      color: c.textSecondary,
      fontSize: 16,
      marginRight: 4,
    },
    campoInput: {
      flex: 1,
      color: c.text,
      fontSize: 15,
      paddingVertical: 12,
    },
    atajosLabel: {
      color: c.textMuted,
      fontSize: 11,
      marginBottom: -4,
    },
    atajosScroll: {
      marginBottom: 4,
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
  });
}
