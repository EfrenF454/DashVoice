import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

import { useTheme } from '@/contexts/ThemeContext';
import { useExpenseStore } from '@/store/expenseStore';
import { getConceptoColor } from '@/constants/Categories';
import { KPICard } from '@/components/KPICard';
import { TopLugaresChart } from '@/components/charts/TopLugaresChart';
import { GastosMensualesChart } from '@/components/charts/GastosMensualesChart';
import { ConceptoPieChartSimple } from '@/components/charts/ConceptoDonutChart';
import { TreemapChart } from '@/components/charts/TreemapChart';
import { TarjetasChart } from '@/components/charts/TarjetasChart';
import type { Gasto, GastoPorConcepto, GastoPorLugar, GastoPorMes, GastoPorTarjeta } from '@/types';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_PADDING = 16;
const INNER_W = SCREEN_W - CARD_PADDING * 2;
// Ancho del contenido dentro de una card (descuenta padding interno de 16 a cada lado)
const CHART_W = INNER_W - 32;
const N_MESES = 6;

// ── Rangos estáticos de los últimos N_MESES ──────────────────────────────────
function generarRangosMeses(n: number) {
  const ahora = new Date();
  return Array.from({ length: n }, (_, i) => {
    const fecha = subMonths(ahora, n - 1 - i);
    return {
      inicio: format(startOfMonth(fecha), 'yyyy-MM-dd'),
      fin: format(endOfMonth(fecha), 'yyyy-MM-dd'),
      anio: fecha.getFullYear(),
      mesLabel: (() => {
        const s = format(fecha, 'MMM', { locale: es });
        return s.charAt(0).toUpperCase() + s.slice(1);
      })(),
    };
  });
}

const RANGOS = generarRangosMeses(N_MESES);

// ── Helpers de cómputo ───────────────────────────────────────────────────────
function topLugares(gastos: Gasto[], top = 10): GastoPorLugar[] {
  const m: Record<string, number> = {};
  gastos.forEach((g) => { m[g.lugar] = (m[g.lugar] ?? 0) + g.monto; });
  return Object.entries(m).map(([lugar, total]) => ({ lugar, total }))
    .sort((a, b) => b.total - a.total).slice(0, top);
}

function porConcepto(gastos: Gasto[]): GastoPorConcepto[] {
  const m: Record<string, number> = {};
  gastos.forEach((g) => { m[g.concepto] = (m[g.concepto] ?? 0) + g.monto; });
  const total = Object.values(m).reduce((s, v) => s + v, 0);
  return Object.entries(m).map(([concepto, t]) => ({
    concepto, total: t,
    porcentaje: total > 0 ? (t / total) * 100 : 0,
    color: getConceptoColor(concepto),
  })).sort((a, b) => b.total - a.total);
}

function porTarjeta(gastos: Gasto[], chart: string[]): GastoPorTarjeta[] {
  const m: Record<string, number> = {};
  gastos.forEach((g) => { m[g.tarjeta] = (m[g.tarjeta] ?? 0) + g.monto; });
  return Object.entries(m).map(([tarjeta, total], i) => ({
    tarjeta, total, color: chart[i % chart.length],
  })).sort((a, b) => b.total - a.total);
}

function aplicarFiltros(
  gastos: Gasto[],
  {
    mesIdx,
    lugar,
    concepto,
    tarjeta,
  }: { mesIdx?: number | null; lugar?: string | null; concepto?: string | null; tarjeta?: string | null },
) {
  let r = gastos;
  if (mesIdx != null) {
    const rango = RANGOS[mesIdx];
    r = r.filter((g) => g.fecha >= rango.inicio && g.fecha <= rango.fin);
  }
  if (lugar) r = r.filter((g) => g.lugar === lugar);
  if (concepto) r = r.filter((g) => g.concepto === concepto);
  if (tarjeta) r = r.filter((g) => g.tarjeta === tarjeta);
  return r;
}

// ── Wrapper: fade suave cuando cambian los datos (sin remounting) ────────────
function FadeWhenChanged({ deps, children }: { deps: string; children: React.ReactNode }) {
  const opacity = useSharedValue(1);
  const prevDeps = useRef(deps);

  useEffect(() => {
    if (prevDeps.current !== deps) {
      opacity.value = withSequence(
        withTiming(0.25, { duration: 80 }),
        withTiming(1,    { duration: 220 }),
      );
      prevDeps.current = deps;
    }
  }, [deps]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={animStyle}>{children}</Animated.View>;
}

// ── Pantalla principal ───────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { colors } = useTheme();
  const { gastos, cargarGastos, cargando } = useExpenseStore();

  // ── Estado de filtros activos ─────────────────────────────────────────────
  const [mesIdx, setMesIdx] = useState<number | null>(null);
  const [lugar, setLugar] = useState<string | null>(null);
  const [concepto, setConcepto] = useState<string | null>(null);
  const [tarjeta, setTarjeta] = useState<string | null>(null);

  useEffect(() => { cargarGastos(); }, []);

  const hayFiltros = mesIdx !== null || !!lugar || !!concepto || !!tarjeta;

  const limpiarTodo = useCallback(() => {
    setMesIdx(null); setLugar(null); setConcepto(null); setTarjeta(null);
  }, []);

  // ── Datos para GastosMensualesChart (excluye filtro de mes) ──────────────
  // Así las barras reflejan el efecto de los otros filtros sobre cada mes
  const gastosMensuales = useMemo((): GastoPorMes[] => {
    return RANGOS.map(({ inicio, fin, anio, mesLabel }) => {
      const total = aplicarFiltros(gastos, { lugar, concepto, tarjeta })
        .filter((g) => g.fecha >= inicio && g.fecha <= fin)
        .reduce((s, g) => s + g.monto, 0);
      return { mes: mesLabel, total, anio };
    });
  }, [gastos, lugar, concepto, tarjeta]);

  // ── Datos por gráfica (cross-filtering: excluye el filtro propio) ─────────
  // TopLugares: filtrado por mes + concepto + tarjeta (NO lugar)
  const datosLugares = useMemo(
    () => topLugares(aplicarFiltros(gastos, { mesIdx, concepto, tarjeta }), 10),
    [gastos, mesIdx, concepto, tarjeta],
  );

  // Concepto + Treemap: filtrado por mes + lugar + tarjeta (NO concepto)
  const datosConcepto = useMemo(
    () => porConcepto(aplicarFiltros(gastos, { mesIdx, lugar, tarjeta })),
    [gastos, mesIdx, lugar, tarjeta],
  );

  // Tarjetas: filtrado por mes + lugar + concepto (NO tarjeta)
  const datosTarjeta = useMemo(
    () => porTarjeta(aplicarFiltros(gastos, { mesIdx, lugar, concepto }), colors.chart),
    [gastos, mesIdx, lugar, concepto, colors.chart],
  );

  // ── KPIs: solo filtro de mes ───────────────────────────────────────────────
  const kpis = useMemo(() => {
    const idxActual = mesIdx ?? N_MESES - 1;
    const rangoActual = RANGOS[idxActual];
    const rangoAnterior = RANGOS[idxActual - 1];

    const totalActual = gastos
      .filter((g) => g.fecha >= rangoActual.inicio && g.fecha <= rangoActual.fin)
      .reduce((s, g) => s + g.monto, 0);

    const totalAnterior = rangoAnterior
      ? gastos
          .filter((g) => g.fecha >= rangoAnterior.inicio && g.fecha <= rangoAnterior.fin)
          .reduce((s, g) => s + g.monto, 0)
      : 0;

    const diferencia = totalActual - totalAnterior;
    const variacion = totalAnterior === 0 ? 0 : (diferencia / totalAnterior) * 100;

    const anio = rangoActual.anio;
    const gastoAnual = gastos
      .filter((g) => g.fecha.startsWith(String(anio)))
      .reduce((s, g) => s + g.monto, 0);

    return {
      gastoAnual,
      gastoMesActual: totalActual,
      gastoMesAnterior: totalAnterior,
      diferenciaMonto: diferencia,
      variacionPorcentual: variacion,
    };
  }, [gastos, mesIdx]);

  // ── Nombres para KPI títulos ──────────────────────────────────────────────
  const nombreMesActual = mesIdx !== null
    ? `${RANGOS[mesIdx].mesLabel} ${RANGOS[mesIdx].anio}`
    : null;
  const nombreMesAnterior = mesIdx != null && mesIdx > 0
    ? `${RANGOS[mesIdx - 1].mesLabel} ${RANGOS[mesIdx - 1].anio}`
    : null;

  // ── Chips de filtros activos ──────────────────────────────────────────────
  const chips = useMemo(() => {
    const lista: Array<{ id: string; emoji: string; label: string; onClear: () => void }> = [];
    if (mesIdx !== null) lista.push({ id: 'mes', emoji: '📅', label: nombreMesActual ?? '', onClear: () => setMesIdx(null) });
    if (lugar) lista.push({ id: 'lugar', emoji: '🏪', label: lugar, onClear: () => setLugar(null) });
    if (concepto) lista.push({ id: 'concepto', emoji: '🏷', label: concepto, onClear: () => setConcepto(null) });
    if (tarjeta) lista.push({ id: 'tarjeta', emoji: '💳', label: tarjeta, onClear: () => setTarjeta(null) });
    return lista;
  }, [mesIdx, lugar, concepto, tarjeta, nombreMesActual]);

  // ── Claves para re-animar gráficas al cambiar sus filtros ─────────────────
  // Cada gráfica usa la clave de los filtros QUE SÍ la afectan (no el propio)
  const keyLugares = `${mesIdx}-${concepto}-${tarjeta}`;
  const keyConcepto = `${mesIdx}-${lugar}-${tarjeta}`;
  const keyTarjeta = `${mesIdx}-${lugar}-${concepto}`;

  const mesActual = format(new Date(), 'MMMM yyyy', { locale: es });

  const styles = useMemo(() => createDashboardStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contenido}
        refreshControl={
          <RefreshControl
            refreshing={cargando}
            onRefresh={cargarGastos}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.saludo}>DashVoice</Text>
            <Text style={styles.fecha}>{mesActual}</Text>
          </View>
          {hayFiltros && (
            <Pressable onPress={limpiarTodo} style={styles.clearAllBtn}>
              <Text style={styles.clearAllTexto}>✕ Quitar todo</Text>
            </Pressable>
          )}
        </View>

        {/* Chips de filtros activos */}
        {hayFiltros && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.chipsRow}>
            {chips.map((chip) => (
              <Pressable key={chip.id} onPress={chip.onClear} style={styles.chip}>
                <Text style={styles.chipTexto}>{chip.emoji} {chip.label}</Text>
                <Text style={styles.chipX}>✕</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* KPIs */}
        <View style={styles.kpiGrid}>
          <KPICard
            titulo={nombreMesActual ? `Anual ${RANGOS[mesIdx!].anio}` : 'Gasto anual'}
            valor={kpis.gastoAnual}
            color={colors.primary}
            colorValor={colors.text}
            icono="📅"
            resaltado={mesIdx !== null}
          />
          <KPICard
            titulo={nombreMesActual ?? 'Mes actual'}
            valor={kpis.gastoMesActual}
            variacion={kpis.variacionPorcentual}
            diferencia={kpis.diferenciaMonto}
            color={colors.primary}
            colorValor={colors.text}
            icono="📆"
            resaltado={mesIdx !== null}
          />
        </View>
        <View style={styles.kpiGrid}>
          <KPICard
            titulo={nombreMesAnterior ?? 'Mes anterior'}
            valor={kpis.gastoMesAnterior}
            color={colors.primary}
            colorValor={colors.text}
            icono="🗓"
            resaltado={mesIdx !== null}
          />
          <KPICard
            titulo="Variación"
            valor={Math.abs(kpis.diferenciaMonto)}
            subtitulo={`${kpis.variacionPorcentual >= 0 ? '▲' : '▼'} ${Math.abs(kpis.variacionPorcentual).toFixed(1)}% vs ant.`}
            color={kpis.diferenciaMonto >= 0 ? colors.danger : colors.success}
            icono={kpis.diferenciaMonto >= 0 ? '📈' : '📉'}
            resaltado={mesIdx !== null}
          />
        </View>

        {/* Gastos Mensuales — no remonta, solo actualiza barras con animación */}
        <View style={styles.seccion}>
          <SeccionHeader titulo="📊 Gastos mensuales (6 meses)" chips={chips} exclude="mes" />
          <GastosMensualesChart
            data={gastosMensuales}
            width={INNER_W}
            indiceMesSeleccionado={mesIdx}
            onMesSeleccionado={(i) => setMesIdx(i)}
          />
        </View>

        {/* Gastos por concepto */}
        <FadeWhenChanged deps={keyConcepto}>
          <View style={styles.seccion}>
            <SeccionHeader titulo="🏷 Gastos por concepto" chips={chips} exclude="concepto" />
            <ConceptoPieChartSimple
              data={datosConcepto}
              conceptoSeleccionado={concepto}
              onConceptoSeleccionado={setConcepto}
            />
          </View>
        </FadeWhenChanged>

        {/* Gastos por tarjeta */}
        <FadeWhenChanged deps={keyTarjeta}>
          <View style={styles.seccion}>
            <SeccionHeader titulo="💳 Gastos por tarjeta" chips={chips} exclude="tarjeta" />
            <TarjetasChart
              data={datosTarjeta}
              tarjetaSeleccionada={tarjeta}
              onTarjetaSeleccionada={setTarjeta}
            />
          </View>
        </FadeWhenChanged>

        {/* Top 10 Establecimientos */}
        <FadeWhenChanged deps={keyLugares}>
          <View style={styles.seccion}>
            <SeccionHeader titulo="🏪 Top 10 Establecimientos" chips={chips} exclude="lugar" />
            <TopLugaresChart
              data={datosLugares}
              width={INNER_W}
              lugarSeleccionado={lugar}
              onLugarSeleccionado={setLugar}
            />
          </View>
        </FadeWhenChanged>

        {/* Mapa de gastos */}
        {datosConcepto.length > 0 && (
          <FadeWhenChanged deps={keyConcepto}>
            <View style={styles.seccion}>
              <SeccionHeader titulo="🗺 Mapa de gastos" chips={chips} exclude="concepto" />
              <TreemapChart
                data={datosConcepto}
                width={CHART_W}
                height={220}
                conceptoSeleccionado={concepto}
                onConceptoSeleccionado={setConcepto}
              />
            </View>
          </FadeWhenChanged>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Componente auxiliar: encabezado de sección con chips relevantes ──────────
type ChipItem = { id: string; emoji: string; label: string; onClear: () => void };

function SeccionHeader({
  titulo,
  chips,
  exclude,
}: {
  titulo: string;
  chips: ChipItem[];
  exclude: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createDashboardStyles(colors), [colors]);
  const relevantes = chips.filter((c) => c.id !== exclude);
  return (
    <View style={styles.seccionHeader}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      {relevantes.length > 0 && (
        <View style={styles.seccionChips}>
          {relevantes.map((c) => (
            <View key={c.id} style={styles.seccionChip}>
              <Text style={styles.seccionChipTexto}>{c.emoji} {c.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Estilos dinámicos ─────────────────────────────────────────────────────────
function createDashboardStyles(c: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    scroll: { flex: 1 },
    contenido: { padding: CARD_PADDING, gap: 16, paddingBottom: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
    saludo: { color: c.text, fontSize: 24, fontWeight: '800' },
    fecha: { color: c.textSecondary, fontSize: 14, marginTop: 2, textTransform: 'capitalize' },
    clearAllBtn: {
      backgroundColor: `${c.danger}22`,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: `${c.danger}44`,
    },
    clearAllTexto: { color: c.danger, fontSize: 12, fontWeight: '700' },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: `${c.primary}22`,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: `${c.primary}44`,
    },
    chipTexto: { color: c.primary, fontSize: 12, fontWeight: '600' },
    chipX: { color: c.primary, fontSize: 11, fontWeight: '700' },
    kpiGrid: { flexDirection: 'row', gap: 12 },
    seccion: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      gap: 14,
      borderWidth: 1,
      borderColor: c.border,
      ...c.cardGlow,
    },
    seccionHeader: { gap: 6 },
    seccionTitulo: { color: c.text, fontSize: 15, fontWeight: '700' },
    seccionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    seccionChip: {
      backgroundColor: `${c.primary}1A`,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    seccionChipTexto: { color: c.primary, fontSize: 10, fontWeight: '600' },
  });
}
