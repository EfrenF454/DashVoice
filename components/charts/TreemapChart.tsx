import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { treemap, hierarchy } from 'd3-hierarchy';
import { useTheme } from '@/contexts/ThemeContext';
import { formatMonto } from '@/utils/formatters';
import type { GastoPorConcepto } from '@/types';

interface Props {
  data: GastoPorConcepto[];
  width: number;
  height?: number;
  conceptoSeleccionado?: string | null;
  onConceptoSeleccionado?: (concepto: string | null) => void;
}

export function TreemapChart({
  data,
  width,
  height = 240,
  conceptoSeleccionado,
  onConceptoSeleccionado,
}: Props) {
  const { colors } = useTheme();

  const nodos = useMemo(() => {
    if (data.length === 0) return [];

    const raiz = hierarchy({
      name: 'root',
      children: data.map((d) => ({ name: d.concepto, value: d.total, color: d.color })),
    }).sum((d: any) => d.value ?? 0);

    const layout = treemap<any>()
      .size([width, height])
      .paddingOuter(4)
      .paddingInner(3)
      .round(true);

    layout(raiz);
    return raiz.leaves();
  }, [data, width, height]);

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin datos disponibles</Text>
      </View>
    );
  }

  const hasSelection = conceptoSeleccionado != null;

  const handlePress = (nombre: string) => {
    onConceptoSeleccionado?.(conceptoSeleccionado === nombre ? null : nombre);
  };

  return (
    <View>
      <Svg width={width} height={height}>
        {nodos.map((nodo: any, idx: number) => {
          const w = nodo.x1 - nodo.x0;
          const h = nodo.y1 - nodo.y0;
          const mostrarTexto = w > 40 && h > 28;
          const isSelected = nodo.data.name === conceptoSeleccionado;
          const opacity = hasSelection && !isSelected ? 0.25 : 0.88;
          const color = colors.chart[idx % colors.chart.length];

          return (
            <React.Fragment key={nodo.data.name}>
              <Rect
                x={nodo.x0}
                y={nodo.y0}
                width={w}
                height={h}
                rx={6}
                fill={color}
                fillOpacity={opacity}
                stroke={isSelected ? '#fff' : colors.background}
                strokeWidth={isSelected ? 2 : 1}
                onPress={() => handlePress(nodo.data.name)}
              />
              {mostrarTexto && (
                <>
                  <SvgText
                    x={nodo.x0 + w / 2}
                    y={nodo.y0 + h / 2 - 6}
                    textAnchor="middle"
                    fill="#fff"
                    fillOpacity={opacity}
                    fontSize={Math.min(12, w / 7)}
                    fontFamily="System"
                    fontWeight="600"
                    onPress={() => handlePress(nodo.data.name)}
                  >
                    {nodo.data.name.length > Math.floor(w / 8)
                      ? nodo.data.name.slice(0, Math.floor(w / 8))
                      : nodo.data.name}
                  </SvgText>
                  {h > 44 && (
                    <SvgText
                      x={nodo.x0 + w / 2}
                      y={nodo.y0 + h / 2 + 10}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.85)"
                      fillOpacity={opacity}
                      fontSize={Math.min(10, w / 9)}
                      fontFamily="System"
                      onPress={() => handlePress(nodo.data.name)}
                    >
                      {formatMonto(nodo.data.value, true)}
                    </SvgText>
                  )}
                </>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
      <Text style={[styles.hint, { color: colors.textMuted }]}>Toca un concepto para filtrar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14 },
  hint: { fontSize: 10, textAlign: 'center', fontStyle: 'italic', marginTop: 8 },
});
