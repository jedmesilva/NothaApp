/**
 * LoanCard — card de empréstimo reutilizado na tela de lista (emprestimos)
 * e na seção "Meus Empréstimos" da home (index).
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CICLO_META, formatBRL, addDays, formatDataShort } from '@/data/loans';
import type { Emprestimo } from '@/data/loans';
import { palette as C, fonts, fontSize, radii } from '@/constants/theme';
import { PoolBar, DetailGrid, StatusBadge } from '@/components/ds';
import type { LoanStatus } from '@/components/ds';

type Props = {
  loan: Emprestimo;
};

export function LoanCard({ loan }: Props) {
  const cicloMeta     = CICLO_META[loan.ciclo];
  const totalAPagar   = loan.valor * (1 + loan.taxaJurosTotal / 100);
  const valorParcela  = totalAPagar / loan.parcelasTotal;
  const valorPago     = valorParcela * loan.parcelasPagas;
  const percentPago   = loan.parcelasTotal > 0
    ? Math.round((loan.parcelasPagas / loan.parcelasTotal) * 100) : 0;
  const percentCaptado = loan.status === 'captacao' && loan.valorCaptado
    ? Math.round((loan.valorCaptado / loan.valor) * 100) : 0;
  const jaConcedido   = loan.status !== 'analise' && loan.status !== 'captacao';
  const hoje          = new Date();
  const dataConcessao = jaConcedido ? addDays(hoje, -(loan.diasDesdeConcessao ?? 0)) : hoje;
  const dataVencimento = addDays(dataConcessao, loan.prazoDias);
  const isAtrasado    = loan.status === 'atrasado';
  const isCaptacao    = loan.status === 'captacao';

  const proximaDataLabel = (() => {
    const dataConc = jaConcedido ? addDays(hoje, -(loan.diasDesdeConcessao ?? 0)) : hoje;
    return formatDataShort(addDays(dataConc, cicloMeta.dias * (loan.parcelasPagas + 1)));
  })();

  return (
    <TouchableOpacity
      style={[
        st.card,
        isAtrasado && st.cardAtrasado,
        isCaptacao && st.cardCaptacao,
      ]}
      onPress={() => router.push({ pathname: '/emprestimo-detalhe', params: { id: String(loan.id) } })}
      activeOpacity={0.85}
    >
      <View style={st.topRow}>
        <View>
          <Text style={st.value}>R$ {formatBRL(loan.valor)}</Text>
          <Text style={st.label}>
            R$ {formatBRL(Math.round(valorParcela))}/{cicloMeta.unidade} · {loan.parcelasTotal}{' '}
            {loan.parcelasTotal === 1 ? cicloMeta.unidade : cicloMeta.unidadePlural}
          </Text>
        </View>
        <StatusBadge status={loan.status as LoanStatus} />
      </View>

      {isCaptacao && (
        <PoolBar
          label="Captação"
          headLeft={`${percentCaptado}% captado`}
          headRight={`R$ ${formatBRL(loan.valorCaptado ?? 0)} de R$ ${formatBRL(loan.valor)}`}
          segments={[{ pct: percentCaptado, variant: 'primary' }]}
          style={{ marginBottom: 18 }}
        />
      )}

      {(loan.status === 'ativo' || isAtrasado) && (
        <PoolBar
          label="Pagamento"
          headLeft={`${percentPago}% pago`}
          headRight={`R$ ${formatBRL(Math.round(valorPago))} de R$ ${formatBRL(Math.round(totalAPagar))}`}
          segments={[{ pct: percentPago, variant: 'primary' }]}
          style={{ marginBottom: 18 }}
        />
      )}

      <DetailGrid
        items={[
          { label: 'Prazo',      value: `${loan.prazoDias} dias`, sub: `vence ${formatDataShort(dataVencimento)}` },
          { label: 'Ciclo',      value: cicloMeta.label, sub: `R$ ${formatBRL(Math.round(valorParcela))}/${cicloMeta.unidade}` },
          { label: 'Taxa total', value: `${loan.taxaJurosTotal}%` },
          { label: loan.status === 'quitado' ? 'Total pago' : 'Total a pagar', value: `R$ ${formatBRL(Math.round(totalAPagar))}` },
        ]}
      />
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  card:         { borderRadius: radii.card, backgroundColor: C.card, padding: 20 },
  cardAtrasado: { borderWidth: 1.5, borderColor: C.red },
  cardCaptacao: { borderWidth: 1.5, borderColor: C.inkFaint, borderStyle: 'dashed' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  value: { fontFamily: fonts.display, fontSize: fontSize['6xl'], color: C.ink, letterSpacing: -0.4 },
  label: { fontSize: fontSize['sm+'], color: C.inkFaint, fontFamily: fonts.regular, marginTop: 2 },
});
