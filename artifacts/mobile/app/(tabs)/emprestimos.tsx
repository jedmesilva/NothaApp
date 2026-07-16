import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { EMPRESTIMOS, CICLO_META, STATUS_META, formatBRL, addDays, formatDataShort } from '@/data/loans';

const C = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  dark: '#15151D',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  red: '#C0392B',
  redBg: '#FBEAE8',
  chipBg: '#F4F5F7',
};


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
  return <Text style={styles.timerText}>{texto}</Text>;
}

function StatusIcon({ status }: { status: string }) {
  const icons: Record<string, { name: string; size: number }> = {
    analise: { name: 'clock', size: 13 },
    captacao: { name: 'users', size: 13 },
    ativo: { name: 'zap', size: 13 },
    atrasado: { name: 'alert-triangle', size: 13 },
    quitado: { name: 'check-circle', size: 13 },
  };
  const icon = icons[status] || icons.analise;
  const badgeColors: Record<string, { bg: string; color: string }> = {
    analise: { bg: C.chipBg, color: C.inkSoft },
    captacao: { bg: C.chipBg, color: C.inkSoft },
    ativo: { bg: C.dark, color: '#fff' },
    atrasado: { bg: C.redBg, color: C.red },
    quitado: { bg: 'transparent', color: C.inkFaint },
  };
  const badge = badgeColors[status] || badgeColors.analise;

  return (
    <View style={[styles.badge, { backgroundColor: badge.bg, borderWidth: status === 'quitado' ? 1 : 0, borderColor: C.line }]}>
      {status === 'captacao' ? (
        <>
          <ContadorCaptacao />
          <Text style={[styles.badgeSep, { color: badge.color }]}> · </Text>
          <Text style={[styles.badgeText, { color: badge.color }]}>Em captação</Text>
        </>
      ) : (
        <>
          <Feather name={icon.name as any} size={icon.size} color={badge.color} />
          <Text style={[styles.badgeText, { color: badge.color }]}>{STATUS_META[status]?.label ?? status}</Text>
        </>
      )}
    </View>
  );
}

export default function EmprestimosScreen() {
  const bottomPad = 100;

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad, gap: 12 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Empréstimos</Text>
          <Text style={styles.subtitle}>{EMPRESTIMOS.length} empréstimos no total</Text>
        </View>

        {EMPRESTIMOS.map((loan) => {
          const cicloMeta = CICLO_META[loan.ciclo];
          const totalAPagar = loan.valor * (1 + loan.taxaJurosTotal / 100);
          const valorParcela = totalAPagar / loan.parcelasTotal;
          const valorPago = valorParcela * loan.parcelasPagas;
          const percentPago = loan.parcelasTotal > 0 ? Math.round((loan.parcelasPagas / loan.parcelasTotal) * 100) : 0;
          const percentCaptado = loan.status === 'captacao' && loan.valorCaptado ? Math.round((loan.valorCaptado / loan.valor) * 100) : 0;
          const jaConcedido = loan.status !== 'analise' && loan.status !== 'captacao';
          const hoje = new Date();
          const dataConcessao = jaConcedido ? addDays(hoje, -(loan.diasDesdeConcessao ?? 0)) : hoje;
          const dataVencimento = addDays(dataConcessao, loan.prazoDias);

          const isAtrasado = loan.status === 'atrasado';
          const isCaptacao = loan.status === 'captacao';
          const proximaDataCalc = (() => {
            const ciclo = CICLO_META[loan.ciclo];
            const dataConc = jaConcedido ? addDays(hoje, -(loan.diasDesdeConcessao ?? 0)) : hoje;
            const proxima = addDays(dataConc, ciclo.dias * (loan.parcelasPagas + 1));
            return formatDataShort(proxima);
          })();

          return (
            <TouchableOpacity
              key={loan.id}
              style={[styles.loanCard, isAtrasado && styles.loanCardAtrasado, isCaptacao && styles.loanCardCaptacao]}
              onPress={() => router.push({ pathname: '/emprestimo-detalhe', params: { id: String(loan.id) } })}
              activeOpacity={0.85}
            >
              <View style={styles.loanTopRow}>
                <View>
                  <Text style={styles.loanValue}>R$ {formatBRL(loan.valor)}</Text>
                  <Text style={styles.loanLabel}>
                    R$ {formatBRL(Math.round(valorParcela))}/{cicloMeta.unidade} · {loan.parcelasTotal} {loan.parcelasTotal === 1 ? cicloMeta.unidade : cicloMeta.unidadePlural}
                  </Text>
                </View>
                <StatusIcon status={loan.status} />
              </View>

              {/* Captação progress */}
              {isCaptacao && (
                <View style={styles.poolBlock}>
                  <Text style={styles.poolLabel}>Captação do pedido</Text>
                  <View style={styles.poolTopRow}>
                    <Text style={styles.poolPercent}>{percentCaptado}% captado</Text>
                    <Text style={styles.poolValue}>R$ {formatBRL(loan.valorCaptado ?? 0)} de R$ {formatBRL(loan.valor)}</Text>
                  </View>
                  <View style={styles.poolTrack}>
                    <View style={[styles.poolFill, { width: `${percentCaptado}%` as any }]} />
                  </View>
                  <View style={styles.poolCaption}>
                    <View style={styles.dotRow}>
                      <View style={[styles.dot, { backgroundColor: C.ink }]} />
                      <Text style={styles.captionText}>Captado</Text>
                    </View>
                    <View style={styles.dotRow}>
                      <View style={[styles.dot, { backgroundColor: C.line, borderWidth: 1, borderColor: C.inkFaint }]} />
                      <Text style={styles.captionText}>Captando</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Payment progress */}
              {(loan.status === 'ativo' || isAtrasado) && (
                <View style={styles.poolBlock}>
                  <Text style={styles.poolLabel}>Pagamento do empréstimo</Text>
                  <View style={styles.poolTopRow}>
                    <Text style={styles.poolPercent}>{percentPago}% pago</Text>
                    <Text style={styles.poolValue}>R$ {formatBRL(Math.round(valorPago))} de R$ {formatBRL(Math.round(totalAPagar))}</Text>
                  </View>
                  <View style={styles.poolTrack}>
                    <View style={[styles.poolFill, { width: `${percentPago}%` as any }]} />
                  </View>
                  <View style={styles.poolCaption}>
                    <View style={styles.dotRow}>
                      <View style={[styles.dot, { backgroundColor: C.ink }]} />
                      <Text style={styles.captionText}>pago</Text>
                    </View>
                    <View style={styles.dotRow}>
                      <View style={[styles.dot, { backgroundColor: C.line, borderWidth: 1, borderColor: C.inkFaint }]} />
                      <Text style={[styles.captionText, isAtrasado && { color: C.red, fontFamily: 'Inter_700Bold' }]}>
                        {isAtrasado ? `atrasado há ${loan.diasAtraso ?? 0} dias` : `próximo vencimento em ${proximaDataCalc}`}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.detailsGrid}>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Prazo</Text>
                  <Text style={styles.detailValue}>{loan.prazoDias} dias</Text>
                  <Text style={styles.detailSub}>vence {formatDataShort(dataVencimento)}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Ciclo</Text>
                  <Text style={styles.detailValue}>{cicloMeta.label}</Text>
                  <Text style={styles.detailSub}>R$ {formatBRL(Math.round(valorParcela))}/{cicloMeta.unidade}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Taxa total</Text>
                  <Text style={styles.detailValue}>{loan.taxaJurosTotal}%</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>{loan.status === 'quitado' ? 'Total pago' : 'Total a pagar'}</Text>
                  <Text style={styles.detailValue}>R$ {formatBRL(Math.round(totalAPagar))}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { paddingTop: 18, paddingHorizontal: 4, paddingBottom: 6 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: C.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: 13.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: C.inkFaint, fontFamily: 'Inter_400Regular' },
  loanCard: { borderRadius: 22, backgroundColor: C.card, padding: 20 },
  loanCardAtrasado: { borderWidth: 1.5, borderColor: C.red },
  loanCardCaptacao: { borderWidth: 1.5, borderColor: C.inkFaint, borderStyle: 'dashed' },
  loanTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  loanValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: C.ink, letterSpacing: -0.4 },
  loanLabel: { fontSize: 12.5, color: C.inkFaint, fontFamily: 'Inter_400Regular', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  badgeSep: { fontSize: 12, opacity: 0.45 },
  timerText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: C.inkSoft },
  poolBlock: { marginBottom: 18 },
  poolLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 6 },
  poolTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  poolPercent: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: C.ink },
  poolValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: C.inkSoft },
  poolTrack: { height: 14, borderRadius: 999, backgroundColor: C.line, overflow: 'hidden', marginBottom: 9 },
  poolFill: { height: '100%', backgroundColor: C.ink },
  poolCaption: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  captionText: { fontSize: 12.5, color: C.inkSoft, fontFamily: 'Inter_400Regular' },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 18, rowGap: 16, columnGap: 12 },
  detailBlock: { width: '46%' },
  detailLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3 },
  detailValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: C.ink },
  detailSub: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_400Regular', marginTop: 2 },
});
