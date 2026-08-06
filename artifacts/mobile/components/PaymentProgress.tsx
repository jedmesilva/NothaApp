/**
 * PaymentProgress — conteúdo puro.
 *
 * Renderiza as 3 linhas de progresso de pagamento:
 *   1. "N parcela(s) mensal/mensais" · "X% pago"
 *   2. Barra de progresso fina
 *   3. "R$ X pago" · "R$ Y total"
 *
 * Não renderiza nenhum título ou cabeçalho — o contexto pai é responsável
 * por exibir o cabeçalho de seção "Pagamento" acima deste componente.
 *
 * Use o prop `style` para margens/padding externo.
 */
import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { palette as C, fonts, fontSize } from '@/constants/theme';
import { ThinBar } from '@/components/ds';
import { formatBRL, parcelasLabel } from '@/data/loans';

type Props = {
  ciclo: string;
  parcelasTotal: number;
  pctPago: number;    // 0–100
  valorPago: number;  // R$
  valorTotal: number; // R$
  style?: ViewStyle;
};

export function PaymentProgress({
  ciclo,
  parcelasTotal,
  pctPago,
  valorPago,
  valorTotal,
  style,
}: Props) {
  return (
    <View style={style}>
      {/* Linha 1: rótulo de parcelas + percentual */}
      <View style={st.head}>
        <Text style={st.headLeft}>
          {parcelasTotal > 0 ? parcelasLabel(ciclo, parcelasTotal) : '—'}
        </Text>
        <Text style={st.headRight}>{pctPago}% pago</Text>
      </View>

      {/* Linha 2: barra */}
      <ThinBar pct={pctPago} context="light" style={st.track} />

      {/* Linha 3: valores */}
      <View style={st.footer}>
        <Text style={st.footerText}>R$ {formatBRL(Math.round(valorPago))} pago</Text>
        <Text style={st.footerText}>R$ {formatBRL(Math.round(valorTotal))} total</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  head:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  headLeft:   { fontFamily: fonts.display, fontSize: fontSize.lg, color: C.ink },
  headRight:  { fontFamily: fonts.display, fontSize: fontSize.base, color: C.inkSoft },
  track:      { marginBottom: 9 },
  footer:     { flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: fontSize.xs, color: C.inkFaint, fontFamily: fonts.regular },
});
