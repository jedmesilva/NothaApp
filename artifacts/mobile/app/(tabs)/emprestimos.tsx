import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { EMPRESTIMOS, CICLO_META, STATUS_META, formatBRL, addDays, formatDataShort } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { PoolBar, PoolLegend, DetailGrid } from '@/components/ds';

// ---------------------------------------------------------------------------
// StatusIcon — badge with live timer for captacao status
// ---------------------------------------------------------------------------
function ContadorCaptacao() {
  const [segundos, setSegundos] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  const texto = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : m > 0 ? `${m}:${pad(s)}min` : `${s}s`;
  return <Text style={st.timerText}>{texto}</Text>;
}

type BadgeStyle = { bg: string; color: string; border?: boolean };
const BADGE_STYLES: Record<string, BadgeStyle> = {
  analise:  { bg: C.chipMuted,  color: C.inkSoft },
  captacao: { bg: C.chipMuted,  color: C.inkSoft },
  ativo:    { bg: C.dark,       color: '#fff' },
  atrasado: { bg: C.redBg,      color: C.red },
  quitado:  { bg: 'transparent', color: C.inkFaint, border: true },
};
const BADGE_ICONS: Record<string, string> = {
  analise: 'clock', captacao: 'users', ativo: 'zap', atrasado: 'alert-triangle', quitado: 'check-circle',
};

function StatusIcon({ status }: { status: string }) {
  const badge = BADGE_STYLES[status] ?? BADGE_STYLES.analise;
  const icon  = BADGE_ICONS[status] ?? 'clock';
  return (
    <View style={[st.badge, { backgroundColor: badge.bg }, badge.border && { borderWidth: 1, borderColor: C.line }]}>
      {status === 'captacao' ? (
        <>
          <ContadorCaptacao />
          <Text style={[st.badgeSep, { color: badge.color }]}> · </Text>
          <Text style={[st.badgeText, { color: badge.color }]}>Em captação</Text>
        </>
      ) : (
        <>
          <Feather name={icon as any} size={13} color={badge.color} />
          <Text style={[st.badgeText, { color: badge.color }]}>{STATUS_META[status]?.label ?? status}</Text>
        </>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function EmprestimosScreen() {
  return (
    <View style={st.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}
      >
        <View style={st.header}>
          <Text style={st.title}>Empréstimos</Text>
          <Text style={st.subtitle}>{EMPRESTIMOS.length} empréstimos no total</Text>
        </View>

        {EMPRESTIMOS.map((loan) => {
          const cicloMeta = CICLO_META[loan.ciclo];
          const totalAPagar     = loan.valor * (1 + loan.taxaJurosTotal / 100);
          const valorParcela    = totalAPagar / loan.parcelasTotal;
          const valorPago       = valorParcela * loan.parcelasPagas;
          const percentPago     = loan.parcelasTotal > 0 ? Math.round((loan.parcelasPagas / loan.parcelasTotal) * 100) : 0;
          const percentCaptado  = loan.status === 'captacao' && loan.valorCaptado
            ? Math.round((loan.valorCaptado / loan.valor) * 100) : 0;
          const jaConcedido     = loan.status !== 'analise' && loan.status !== 'captacao';
          const hoje            = new Date();
          const dataConcessao   = jaConcedido ? addDays(hoje, -(loan.diasDesdeConcessao ?? 0)) : hoje;
          const dataVencimento  = addDays(dataConcessao, loan.prazoDias);
          const isAtrasado      = loan.status === 'atrasado';
          const isCaptacao      = loan.status === 'captacao';

          const proximaDataLabel = (() => {
            const ciclo  = CICLO_META[loan.ciclo];
            const dataConc = jaConcedido ? addDays(hoje, -(loan.diasDesdeConcessao ?? 0)) : hoje;
            return formatDataShort(addDays(dataConc, ciclo.dias * (loan.parcelasPagas + 1)));
          })();

          return (
            <TouchableOpacity
              key={loan.id}
              style={[
                st.loanCard,
                isAtrasado && st.loanCardAtrasado,
                isCaptacao && st.loanCardCaptacao,
              ]}
              onPress={() => router.push({ pathname: '/emprestimo-detalhe', params: { id: String(loan.id) } })}
              activeOpacity={0.85}
            >
              <View style={st.loanTopRow}>
                <View>
                  <Text style={st.loanValue}>R$ {formatBRL(loan.valor)}</Text>
                  <Text style={st.loanLabel}>
                    R$ {formatBRL(Math.round(valorParcela))}/{cicloMeta.unidade} · {loan.parcelasTotal}{' '}
                    {loan.parcelasTotal === 1 ? cicloMeta.unidade : cicloMeta.unidadePlural}
                  </Text>
                </View>
                <StatusIcon status={loan.status} />
              </View>

              {/* Captação progress */}
              {isCaptacao && (
                <PoolBar
                  label="Captação"
                  headLeft={`${percentCaptado}% captado`}
                  headRight={`R$ ${formatBRL(loan.valorCaptado ?? 0)} de R$ ${formatBRL(loan.valor)}`}
                  segments={[{ pct: percentCaptado, variant: 'primary' }]}
                  style={{ marginBottom: 18 }}
                />
              )}

              {/* Payment progress */}
              {(loan.status === 'ativo' || isAtrasado) && (
                <PoolBar
                  label="Vencimento do empréstimo"
                  headLeft={`${percentPago}% pago`}
                  headRight={`R$ ${formatBRL(Math.round(valorPago))} de R$ ${formatBRL(Math.round(totalAPagar))}`}
                  segments={[{ pct: percentPago, variant: 'primary' }]}
                  style={{ marginBottom: 18 }}
                  footer={
                    <PoolLegend
                      items={[
                        { color: C.ink, label: 'pago' },
                        {
                          color: C.line,
                          label: isAtrasado
                            ? `atrasado há ${loan.diasAtraso ?? 0} dias`
                            : `próximo vencimento em ${proximaDataLabel}`,
                          bold: isAtrasado,
                        },
                      ]}
                    />
                  }
                />
              )}

              <DetailGrid
                items={[
                  { label: 'Prazo',    value: `${loan.prazoDias} dias`, sub: `vence ${formatDataShort(dataVencimento)}` },
                  { label: 'Ciclo',    value: cicloMeta.label, sub: `R$ ${formatBRL(Math.round(valorParcela))}/${cicloMeta.unidade}` },
                  { label: 'Taxa total', value: `${loan.taxaJurosTotal}%` },
                  { label: loan.status === 'quitado' ? 'Total pago' : 'Total a pagar', value: `R$ ${formatBRL(Math.round(totalAPagar))}` },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { paddingTop: spacing[4], paddingHorizontal: 4, paddingBottom: spacing[2] },
  title:    { fontFamily: fonts.display, fontSize: fontSize['6xl'], color: C.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: fontSize['base+'], color: C.inkSoft, fontFamily: fonts.regular, marginTop: 2 },
  loanCard: { borderRadius: radii.card, backgroundColor: C.card, padding: 20 },
  loanCardAtrasado: { borderWidth: 1.5, borderColor: C.red },
  loanCardCaptacao: { borderWidth: 1.5, borderColor: C.inkFaint, borderStyle: 'dashed' },
  loanTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loanValue: { fontFamily: fonts.display, fontSize: fontSize['6xl'], color: C.ink, letterSpacing: -0.4 },
  loanLabel: { fontSize: fontSize['sm+'], color: C.inkFaint, fontFamily: fonts.regular, marginTop: 2 },
  // Badge (StatusIcon)
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  badgeText: { fontSize: fontSize.sm, fontFamily: fonts.bold },
  badgeSep:  { fontSize: fontSize.sm, opacity: 0.45 },
  timerText: { fontSize: fontSize.sm, fontFamily: fonts.bold, color: C.inkSoft },
});
