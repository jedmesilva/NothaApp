import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useInvestorOffers, useRespondToOffer } from '@/hooks/useInvestorOffers';
import { useToast } from '@/contexts/ToastContext';
import { useAdjustedAmounts } from '@/contexts/AdjustedAmountsContext';
import { CICLO_META, formatBRL, addDays, formatData, formatDataComAno } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  BackButton, StatusBadge, PoolBar, PoolLegend, DetailGrid,
  InstallmentBadge, AlertBanner, GhostButton, ModalSheet, Timeline,
  Eyebrow, DetailLabel, ScreenTitle, SectionTitle, PageTitle,
} from '@/components/ds';
import { PaymentProgress } from '@/components/PaymentProgress';
import { OfferPaymentHint } from '@/components/OfferPaymentHint';
import { OfferMetricsBlock } from '@/components/OfferMetricsBlock';
import type { LoanStatus, TimelineEvent } from '@/components/ds';

// ─── Tipo de exibição ────────────────────────────────────────────────────────
type PosDisplay = {
  contratoId: string;
  valorInvestido: number;
  originalInvestido: number;
  totalRetornado: number;
  taxaJurosTotal: number;
  prazoDias: number;
  ciclo: 'diario' | 'semanal' | 'mensal';
  status: string;
  parcelasTotal: number;
  parcelasRecebidas: number;
  diasDesdeConcessao?: number;
  diasAtraso?: number;
  jaCaptado: number;
  valorTotalPedido: number;
  tomadorScore: string;
  emprestimosAnteriores: number;
  valorTotalTomado: number;
  cidade: string;
  proposito: string;
  installments: never[];
  jaInvestiu: boolean;
  loanCreatedAt?: string;
};

export default function OfertaDetalheScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: offersData, isLoading: offersLoading } = useInvestorOffers();
  const { mutateAsync: respond, isPending: isResponding } = useRespondToOffer();
  const { showToast } = useToast();

  const [showTimeline,    setShowTimeline]    = useState(false);
  const [showPrevisao,    setShowPrevisao]    = useState(false);
  const [aceitou,         setAceitou]         = useState(false);
  const { getAmount } = useAdjustedAmounts();
  const adjustedCents = getAmount(id);

  const isLoading = offersLoading;

  // ── Constrói o objeto de exibição a partir dos dados da API ──────────────
  let posicao: PosDisplay | undefined;

  if (!isLoading) {
    const offer = offersData?.offers.find((o) => o.id === id);
    if (offer) {
      posicao = {
        contratoId:            offer.loan.contractId,
        valorInvestido:        offer.maxAmountCents / 100,
        originalInvestido:     offer.maxAmountCents / 100,
        totalRetornado:        0,
        taxaJurosTotal:        offer.ratePct / 100,
        prazoDias:             offer.loan.termDays,
        ciclo:                 offer.loan.cycle,
        status:                'captacao',
        parcelasTotal:         offer.loan.installmentsTotal,
        parcelasRecebidas:     0,
        // Quanto já foi captado sem contar esta oferta — evita dupla-contagem
        jaCaptado:             Math.max(0, offer.loan.fundedAmountCents - offer.maxAmountCents) / 100,
        valorTotalPedido:      offer.loan.amountCents / 100,
        tomadorScore:          '—',
        emprestimosAnteriores: 0,
        valorTotalTomado:      0,
        cidade:                '—',
        proposito:             '—',
        installments:          [],
        jaInvestiu:            false,
        loanCreatedAt:         offer.loan.fundingStartedAt,
      };
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={C.ink} />
      </View>
    );
  }

  // ── Não encontrado ────────────────────────────────────────────────────────
  if (!posicao) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: C.inkFaint, fontFamily: fonts.regular }}>Oferta não encontrada.</Text>
      </View>
    );
  }

  const {
    contratoId, valorInvestido: _valorBase, originalInvestido: _origBase, totalRetornado,
    taxaJurosTotal, prazoDias, ciclo,
    status, parcelasTotal, parcelasRecebidas,
    tomadorScore, emprestimosAnteriores, valorTotalTomado, cidade, proposito,
    jaInvestiu,
  } = posicao;

  // ── Slider ────────────────────────────────────────────────────────────────
  const offerMaxCents     = Math.round(_valorBase * 100);
  const offerRawMinCents  = offersData?.offers.find((o) => o.id === id)?.minAmountCents ?? 0;
  const sliderCents       = adjustedCents > 0 ? adjustedCents : offerMaxCents;

  // Override investido/original so all hero-card calculations track the slider
  const valorInvestido    = sliderCents / 100;
  const originalInvestido = sliderCents / 100;

  const cicloMeta      = CICLO_META[ciclo];
  const totalComRetorno = originalInvestido * (1 + taxaJurosTotal / 100);
  const retornoTotal    = totalComRetorno - originalInvestido;

  const jaConcedido    = posicao.status !== 'captacao';
  const hoje           = new Date();
  const dataConcessao  = jaConcedido
    ? addDays(hoje, -(posicao.diasDesdeConcessao ?? 0))
    : hoje;
  const dataSolicitacao       = addDays(dataConcessao, -3);
  const dataCaptacaoIniciada  = addDays(dataSolicitacao, 1);
  const dataCaptacaoConcluida = addDays(dataConcessao, -1);
  const dataInvestimento      = addDays(dataConcessao, -2);
  const dataVencimentoFinal   = addDays(dataConcessao, prazoDias);
  const vencimentoEhEstimado  = !jaConcedido;

  // Pool bar — captação
  const pctCaptadoOutros = posicao.valorTotalPedido > 0
    ? Math.round((posicao.jaCaptado / posicao.valorTotalPedido) * 100)
    : 0;
  const pctTotal = posicao.valorTotalPedido > 0
    ? Math.round(((posicao.jaCaptado + valorInvestido) / posicao.valorTotalPedido) * 100)
    : 0;
  const pctPosClamped = Math.max(0, pctTotal - pctCaptadoOutros);

  // Parcelas previstas (captação) — estimativa baseada em prazo/ciclo
  const parcelasPrevistas = !jaConcedido ? Math.round(prazoDias / cicloMeta.dias) : 0;
  const parcelasPrevisao  = !jaConcedido && parcelasPrevistas > 0
    ? Array.from({ length: parcelasPrevistas }, (_, i) => ({
        numero: i + 1,
        diasAposConcessao: (i + 1) * cicloMeta.dias,
      }))
    : [];

  const parcelasRef      = jaConcedido ? parcelasTotal : parcelasPrevistas;
  const valorRecebimento = parcelasRef > 0 ? totalComRetorno / parcelasRef : 0;
  const pctPago          = 0;
  const recebidoValor    = totalRetornado;

  const parcelasRestantes = parcelasTotal - parcelasRecebidas;
  const saldoRestante     = valorInvestido;

  const todosRecebidos = false;
  const jaEncerrado    = false;

  const timelineEvents: TimelineEvent[] = [
    { label: 'Solicitação',            date: dataSolicitacao,                                    done: true         },
    { label: 'Captação iniciada',      date: dataCaptacaoIniciada,                               done: true         },
    { label: 'Investimento realizado', ...(jaInvestiu ? { date: dataInvestimento } : {}),        done: jaInvestiu   },
    { label: 'Captação concluída',     ...(jaConcedido ? { date: dataCaptacaoConcluida } : {}),  done: jaConcedido  },
    { label: 'Concedido',              ...(jaConcedido ? { date: dataConcessao } : {}),          done: jaConcedido  },
    { label: 'Pagamentos',             done: todosRecebidos, progress: { value: jaConcedido ? parcelasRecebidas : 0, total: jaConcedido ? parcelasTotal : parcelasPrevistas } },
    { label: 'Encerrado',              ...(jaEncerrado ? { date: dataVencimentoFinal } : {}),    done: jaEncerrado  },
  ];

  const numeroDoContrato = emprestimosAnteriores === 0
    ? 'Primeiro'
    : `${emprestimosAnteriores + 1}º empréstimo`;

  const handleAceitar = async () => {
    if (aceitou) return;
    setAceitou(true);
    try {
      await respond({ offerId: String(id), action: 'accepted', amountCents: sliderCents });
    } catch (_) { /* continua mesmo com erro de rede */ }
    router.back();
    showToast({
      title: 'Oferta aceita',
      subtitle: `R$ ${formatBRL(sliderCents / 100)} investidos em ${contratoId}`,
      actionLabel: 'Ver meus ativos',
      onAction: () => router.push('/ativos' as any),
      duration: 6000,
    });
  };

  const footerHeight = (Platform.OS === 'ios' ? insets.bottom : 0) + 80;

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>

      {/* ── Header fixo ── */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <ScreenTitle>Detalhes da oferta</ScreenTitle>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: !aceitou ? footerHeight + 16 : 48 }}>

        {/* ── Hero dark card ── */}
        <View style={s.heroCard}>
          <View style={s.heroTopRow}>
            <Eyebrow context="dark" style={{ marginBottom: 0 }}>Rendimento</Eyebrow>
            <StatusBadge
              status={status as LoanStatus}
              context="dark"
              createdAt={status === 'captacao' ? posicao.loanCreatedAt : undefined}
            />
          </View>

          <Text style={s.heroValue}>
            <Text style={s.heroSign}>+</Text>{taxaJurosTotal}%
          </Text>
          <Text style={s.heroCaption}>
            R$ {formatBRL(Math.round(retornoTotal))} em {prazoDias} dias
          </Text>

          <View style={s.heroDivider} />

          <OfferMetricsBlock
            investimento={`R$ ${formatBRL(valorInvestido)}`}
            retorno={`R$ ${formatBRL(Math.round(totalComRetorno))}`}
            prazo={`${prazoDias} dias`}
            offerId={id}
            maxAmountCents={offerMaxCents}
            minAmountCents={offerRawMinCents}
            showSlider={!aceitou}
            context="dark"
          />

          {/* ── Captação: só enquanto não concedido ── */}
          {!jaConcedido && <View style={s.heroDivider} />}
          {!jaConcedido && (
            <PoolBar
              label="Captação"
              headLeft={`${pctCaptadoOutros}% captado`}
              headRight={`R$ ${formatBRL(posicao.jaCaptado)} de R$ ${formatBRL(posicao.valorTotalPedido)}`}
              segments={[
                { pct: pctCaptadoOutros, variant: 'primary' },
                { pct: pctPosClamped,    variant: 'secondary' },
              ]}
              context="dark"
              style={{ marginBottom: 20 }}
              footer={
                <PoolLegend
                  context="dark"
                  items={[
                    { color: '#fff',        label: 'outros credores' },
                    { color: C.onDarkFaint, label: 'esta oferta' },
                  ]}
                />
              }
            />
          )}

        </View>

        {/* ── Pagamento (captação: hint simples; pós-concessão: progresso real) ── */}
        {!jaConcedido && (
          <View style={s.vencimentosCard}>
            <TouchableOpacity
              style={s.sectionHeader}
              onPress={() => setShowPrevisao((v) => !v)}
              activeOpacity={0.8}
            >
              <DetailLabel style={{ marginBottom: 0 }}>Pagamento</DetailLabel>
              <View style={s.sectionChevron} pointerEvents="none">
                <Feather name={showPrevisao ? 'chevron-up' : 'chevron-down'} size={18} color={C.inkFaint} />
              </View>
            </TouchableOpacity>

            <OfferPaymentHint
              ciclo={ciclo}
              parcelasTotal={parcelasTotal}
              style={s.paymentBarContainer}
            />

            {showPrevisao && (
              <View style={s.expandedContent}>
                <View style={s.previsaoAviso}>
                  <Feather name="info" size={13} color={C.inkFaint} style={{ marginTop: 1 }} />
                  <Text style={s.previsaoAvisoText}>
                    As datas dos vencimentos serão confirmadas após a conclusão da captação.
                  </Text>
                </View>
                {parcelasPrevisao.map((p) => (
                  <View key={p.numero} style={s.parcelaCard}>
                    <InstallmentBadge variant="default" label={String(p.numero)} />
                    <View style={s.parcelaInfo}>
                      <Text style={s.parcelaLabel}>~{p.diasAposConcessao} dias após a concessão</Text>
                      <Text style={s.parcelaValue}>R$ {formatBRL(Math.round(valorRecebimento))}</Text>
                    </View>
                    <View style={s.statusTag}>
                      <Text style={[s.statusTagText, s.statusTagPrevisto]}>À receber</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {jaConcedido && (
          <View style={s.vencimentosCard}>
            <View style={s.sectionHeader}>
              <DetailLabel style={{ marginBottom: 0 }}>Pagamento</DetailLabel>
            </View>
            <PaymentProgress
              ciclo={ciclo}
              parcelasTotal={parcelasTotal}
              pctPago={pctPago}
              valorPago={recebidoValor}
              valorTotal={totalComRetorno}
              style={s.paymentBarContainer}
            />
          </View>
        )}

        {/* ── Sobre o tomador ── */}
        <View style={s.tomadorCard}>
          <SectionTitle style={{ fontSize: fontSize['md+'], marginBottom: spacing[4] }}>Sobre o tomador</SectionTitle>

          <View style={s.tomadorGridWrap}>
            <DetailGrid
              items={[
                { label: 'Classificação', value: tomadorScore },
                { label: 'Histórico',     value: numeroDoContrato },
                { label: 'Já tomado',     value: emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(valorTotalTomado)}` },
                { label: 'Cidade',        value: cidade },
              ]}
            />
          </View>

          <DetailLabel style={{ marginBottom: 4 }}>Propósito declarado</DetailLabel>
          <Text style={s.propositoValue}>{proposito}</Text>
        </View>

        {/* ── Datas (toca → modal de timeline) ── */}
        <TouchableOpacity style={s.datesRow} onPress={() => setShowTimeline(true)} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            <DetailLabel style={{ marginBottom: 3 }}>Em captação desde</DetailLabel>
            <Text style={s.dateValue}>{formatDataComAno(hoje)}</Text>
          </View>
          <View style={s.datesDivider} />
          <View style={{ flex: 1 }}>
            <DetailLabel style={{ marginBottom: 3 }}>
              {vencimentoEhEstimado ? 'Vencimento estimado' : 'Vencimento'}
            </DetailLabel>
            <Text style={s.dateValue}>{formatDataComAno(dataVencimentoFinal)}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={C.inkFaint} />
        </TouchableOpacity>

        {/* ── Contrato ID ── */}
        <Text style={s.contratoId}>Contrato Nº {contratoId}</Text>

        {/* ── Ajuda ── */}
        <GhostButton
          label="Precisa de ajuda com essa oferta?"
          onPress={() => {}}
          style={{ marginHorizontal: spacing[4], marginTop: spacing[3] }}
        />

      </ScrollView>

      {/* ── Modal: histórico / timeline ── */}
      <ModalSheet
        visible={showTimeline}
        onClose={() => setShowTimeline(false)}
        grabber={false}
        style={{ padding: spacing[5], paddingTop: spacing[4] }}
      >
        <View style={s.modalHeader}>
          <PageTitle size={fontSize.xl}>Histórico</PageTitle>
          <TouchableOpacity style={s.modalClose} onPress={() => setShowTimeline(false)}>
            <Feather name="x" size={16} color={C.ink} />
          </TouchableOpacity>
        </View>

        <Timeline events={timelineEvents} />
      </ModalSheet>

      {/* ── Footer fixo: aceitar oferta ── */}
      {!aceitou && (
        <View style={[s.footer, { paddingBottom: (Platform.OS === 'ios' ? insets.bottom : 0) + spacing[4] }]}>
          <TouchableOpacity
            style={[s.footerBtn, isResponding && { opacity: 0.6 }]}
            onPress={handleAceitar}
            activeOpacity={0.85}
            disabled={isResponding}
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={s.footerBtnText}>Aceitar oferta</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: spacing[3] },

  heroCard:     { borderRadius: radii.hero, marginHorizontal: spacing[4], marginTop: spacing[4], marginBottom: spacing[4], padding: spacing[6], backgroundColor: C.dark },
  heroTopRow:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  heroValue:    { fontFamily: fonts.display, fontSize: fontSize.mega, color: '#fff', letterSpacing: -1.1, lineHeight: 50, marginBottom: 8 },
  heroSign:     { fontSize: 24, fontFamily: fonts.display },
  heroCaption:  { fontSize: fontSize['base+'], color: C.onDarkFaint, fontFamily: fonts.regular, marginBottom: 16 },
  heroDivider:  { height: 1, backgroundColor: C.onDarkBorder, marginBottom: 20 },
  sliderCard:   { marginHorizontal: spacing[4], marginBottom: spacing[4], borderRadius: radii.card, backgroundColor: C.card, padding: spacing[5], paddingBottom: spacing[4] },
  barFooter:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  barFooterText: { fontSize: fontSize.xs, color: C.onDarkFaint, fontFamily: fonts.regular },

  datesRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing[4], marginBottom: spacing[4], padding: 14, borderRadius: radii.lg, backgroundColor: C.card },
  datesDivider: { width: 1, height: 30, backgroundColor: C.line },
  dateValue:    { fontFamily: fonts.display, fontSize: fontSize['base+'], color: C.ink },

  vencimentosCard:      { marginHorizontal: spacing[4], marginBottom: spacing[4], borderRadius: radii.card, backgroundColor: C.card, overflow: 'hidden' },
  sectionHeader:        { paddingHorizontal: spacing[4] + 2, paddingTop: spacing[3] + 2, paddingBottom: spacing[2], position: 'relative' },
  sectionChevron:       { position: 'absolute', right: spacing[4] + 2, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  paymentBarContainer:  { paddingHorizontal: spacing[4] + 2, paddingBottom: spacing[4] },
  expandedContent:      {},
  parcelaCard:          { flexDirection: 'row', alignItems: 'center', gap: 14, padding: spacing[4], borderTopWidth: 1, borderTopColor: C.line },
  parcelaCardAtrasada:  { backgroundColor: C.redBg },
  parcelaCardRecebida:  { opacity: 0.55 },
  parcelaInfo:          { flex: 1 },
  parcelaLabel:         { fontSize: fontSize['sm+'], color: C.inkFaint, fontFamily: fonts.regular, marginBottom: 2 },
  parcelaLabelAtrasada: { color: C.red, fontFamily: fonts.bold },
  parcelaValue:         { fontFamily: fonts.display, fontSize: fontSize.base },
  statusTag:            { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 },
  statusTagAtrasada:    {},
  statusTagText:        { fontSize: fontSize['sm+'], fontFamily: fonts.bold, color: C.inkSoft },
  statusTagPrevisto:    { color: C.inkFaint },

  previsaoAviso:     { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginHorizontal: spacing[4], marginBottom: spacing[2], marginTop: -2 },
  previsaoAvisoText: { flex: 1, fontSize: fontSize.xs, color: C.inkFaint, fontFamily: fonts.regular, lineHeight: 16 },

  tomadorCard:     { marginHorizontal: spacing[4], marginBottom: spacing[4], borderRadius: radii.card, backgroundColor: C.card, padding: spacing[5] },
  tomadorGridWrap: { borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: spacing[4], marginBottom: spacing[4] },
  propositoValue:  { fontSize: fontSize.base, fontFamily: fonts.regular, color: C.ink, lineHeight: 20 },

  contratoId: { fontSize: fontSize.sm, color: C.inkFaint, fontFamily: fonts.regular, textAlign: 'center', marginTop: spacing[3], marginBottom: spacing[1] },

  footer:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line, paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  footerBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: radii.lg, backgroundColor: C.dark },
  footerBtnText: { fontSize: fontSize['base+'], fontFamily: fonts.bold, color: '#fff' },

  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] + 2 },
  modalClose:  { width: 32, height: 32, borderRadius: radii.md, backgroundColor: C.chipMuted, alignItems: 'center', justifyContent: 'center' },
});
