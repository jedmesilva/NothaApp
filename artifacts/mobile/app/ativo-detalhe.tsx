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
import { useInvestorPositions, getPosStatus } from '@/hooks/useInvestorPositions';
import type { InstallmentSummary } from '@/hooks/useInvestorPositions';
import { useInvestorOffers, useRespondToOffer } from '@/hooks/useInvestorOffers';
import { useToast } from '@/contexts/ToastContext';
import { useAdjustedAmounts } from '@/contexts/AdjustedAmountsContext';
import { CICLO_META, formatBRL, addDays, formatData, formatDataComAno } from '@/data/loans';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  BackButton, StatusBadge, PoolBar, PoolLegend, DetailGrid,
  InstallmentBadge, AlertBanner, GhostButton, ModalSheet, Timeline, ThinBar,
} from '@/components/ds';
import ValueSlider from '@/components/ValueSlider';
import type { LoanStatus, TimelineEvent } from '@/components/ds';

const PAGAMENTOS_LABEL: Record<string, string> = {
  diario: 'diários', semanal: 'semanais', mensal: 'mensais',
};
const CICLO_UNIT: Record<string, string> = {
  diario: 'dia', semanal: 'semana', mensal: 'mês',
};
const CICLO_UNIT_PLURAL: Record<string, string> = {
  diario: 'dias', semanal: 'semanas', mensal: 'meses',
};

// ─── Tipo de exibição unificado ──────────────────────────────────────────────
type PosDisplay = {
  contratoId: string;
  valorInvestido: number;        // principalBalanceCents / 100
  originalInvestido: number;     // originalPrincipalCents / 100
  totalRetornado: number;        // totalReturnedCents / 100
  taxaJurosTotal: number;        // ratePct (%)
  prazoDias: number;
  ciclo: 'diario' | 'semanal' | 'mensal';
  status: string;
  parcelasTotal: number;
  parcelasRecebidas: number;
  diasDesdeConcessao?: number;
  diasAtraso?: number;
  jaCaptado: number;             // já captado por outros investidores (R$)
  valorTotalPedido: number;      // loan.amountCents / 100
  tomadorScore: string;
  emprestimosAnteriores: number;
  valorTotalTomado: number;
  cidade: string;
  proposito: string;
  installments: InstallmentSummary[];
  jaInvestiu: boolean;
};

export default function AtivoDetalheScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const isOferta = source === 'oferta';

  const { data: posData,    isLoading: posLoading    } = useInvestorPositions();
  const { data: offersData, isLoading: offersLoading } = useInvestorOffers();
  const { mutateAsync: respond, isPending: isResponding } = useRespondToOffer();
  const { showToast } = useToast();

  const [showTimeline,    setShowTimeline]    = useState(false);
  const [showVencimentos, setShowVencimentos] = useState(false);
  const [showPrevisao,    setShowPrevisao]    = useState(false);
  const [aceitou,         setAceitou]         = useState(false);
  const { getAmount, setAmount } = useAdjustedAmounts();
  const adjustedCents = isOferta ? getAmount(id) : 0;

  const isLoading = isOferta ? offersLoading : posLoading;

  // ── Constrói o objeto de exibição a partir dos dados da API ──────────────
  let posicao: PosDisplay | undefined;

  if (!isLoading) {
    if (isOferta) {
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
        };
      }
    } else {
      const pos = posData?.positions.find((p) => p.id === id);
      if (pos) {
        const posStatus  = getPosStatus(pos);
        const grantedAt  = pos.loan.grantedAt
          ? new Date(pos.loan.grantedAt.slice(0, 10) + 'T00:00:00')
          : null;
        const diasDesdeConcessao = grantedAt
          ? Math.max(0, Math.floor((Date.now() - grantedAt.getTime()) / 86400000))
          : undefined;
        const diasAtraso = pos.earliestOverdue
          ? Math.max(0, Math.floor(
              (Date.now() - new Date(pos.earliestOverdue.dueDate + 'T00:00:00').getTime()) / 86400000,
            ))
          : undefined;

        posicao = {
          contratoId:            pos.loan.contractId,
          valorInvestido:        pos.principalBalanceCents / 100,
          originalInvestido:     pos.originalPrincipalCents / 100,
          totalRetornado:        pos.totalReturnedCents / 100,
          taxaJurosTotal:        pos.ratePct / 100,
          prazoDias:             pos.loan.termDays,
          ciclo:                 pos.loan.cycle,
          status:                posStatus,
          parcelasTotal:         pos.loan.installmentsTotal,
          parcelasRecebidas:     pos.installments.filter((i) => i.status === 'paid').length,
          diasDesdeConcessao,
          diasAtraso,
          jaCaptado:             Math.max(0, pos.loan.fundedAmountCents - pos.principalBalanceCents) / 100,
          valorTotalPedido:      pos.loan.amountCents / 100,
          tomadorScore:          '—',
          emprestimosAnteriores: 0,
          valorTotalTomado:      0,
          cidade:                '—',
          proposito:             '—',
          installments:          pos.installments,
          jaInvestiu:            true,
        };
      }
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
        <Text style={{ color: C.inkFaint, fontFamily: fonts.regular }}>Ativo não encontrado.</Text>
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

  // ── Slider (oferta) ───────────────────────────────────────────────────────
  const offerMaxCents = isOferta ? Math.round(_valorBase * 100) : 0;
  const offerMinCents = isOferta
    ? (() => {
        const offer = offersData?.offers.find((o) => o.id === id);
        return offer?.minAmountCents ?? Math.max(1_000, Math.round(offerMaxCents * 0.25 / 100) * 100);
      })()
    : 0;
  const sliderCents = isOferta
    ? (adjustedCents > 0 ? adjustedCents : offerMaxCents)
    : Math.round(_valorBase * 100);

  // Override investido/original so all hero-card calculations track the slider
  const valorInvestido    = isOferta ? sliderCents / 100 : _valorBase;
  const originalInvestido = isOferta ? sliderCents / 100 : _origBase;

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
  const pctPago          = jaConcedido && parcelasTotal > 0
    ? Math.round((parcelasRecebidas / parcelasTotal) * 100)
    : 0;
  const recebidoValor    = totalRetornado;

  // Parcelas reais (ativo/atrasado/quitado) — vindas da API
  const parcelas = jaConcedido && posicao.installments.length > 0
    ? posicao.installments.map((inst) => ({
        numero: inst.installmentNumber,
        data:   new Date(inst.dueDate + 'T00:00:00'),
        status: (inst.status === 'paid'
          ? 'recebida'
          : inst.status === 'overdue'
          ? 'atrasada'
          : 'pendente') as 'recebida' | 'atrasada' | 'pendente',
      }))
    : [];

  const parcelasRestantes = parcelasTotal - parcelasRecebidas;
  const saldoRestante     = valorInvestido; // saldo em aberto (principal restante)

  const todosRecebidos = jaConcedido && parcelasRecebidas >= parcelasTotal && parcelasTotal > 0;
  const jaEncerrado    = status === 'quitado' || todosRecebidos;

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
        <Text style={s.title}>Detalhes do ativo</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: isOferta && !aceitou ? footerHeight + 16 : 48 }}>

        {/* ── Alert: tomador em atraso ── */}
        {status === 'atrasado' && posicao.diasAtraso != null && (
          <AlertBanner
            style={{ marginHorizontal: spacing[4], marginBottom: 2 }}
            title="Tomador em atraso"
            message={`O vencimento está atrasado há ${posicao.diasAtraso} ${posicao.diasAtraso === 1 ? 'dia' : 'dias'}`}
          />
        )}

        {/* ── Hero dark card ── */}
        <View style={s.heroCard}>
          <View style={s.heroTopRow}>
            <Text style={s.heroEyebrow}>{isOferta ? 'Retorno oferecido' : 'Retorno do contrato'}</Text>
            <StatusBadge status={status as LoanStatus} context="dark" />
          </View>

          <Text style={s.heroValue}>
            <Text style={s.heroSign}>+</Text>{taxaJurosTotal}%
          </Text>
          <Text style={s.heroCaption}>
            Rendimento de R$ {formatBRL(Math.round(retornoTotal))} em {prazoDias} dias
          </Text>

          <View style={s.heroDivider} />

          <View style={s.splitRow}>
            <View>
              <Text style={s.splitLabel}>Investimento</Text>
              <Text style={s.splitValue}>R$ {formatBRL(valorInvestido)}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={s.splitLabel}>Retorno</Text>
              <Text style={s.splitValue}>R$ {formatBRL(Math.round(totalComRetorno))}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.splitLabel}>Prazo</Text>
              <Text style={s.splitValue}>{prazoDias} dias</Text>
            </View>
          </View>

          {/* ── Slider — dentro do card, abaixo das métricas ── */}
          {isOferta && !aceitou && (
            <View style={s.sliderInCard}>
              <ValueSlider
                minCents={offerMinCents}
                maxCents={offerMaxCents}
                valueCents={sliderCents}
                onChange={(cents) => setAmount(id, cents)}
                showValue={false}
                context="dark"
              />
            </View>
          )}

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
                    { color: C.onDarkFaint, label: isOferta ? 'esta oferta' : 'minha participação' },
                  ]}
                />
              }
            />
          )}

        </View>

        {/* ── Previsão de vencimentos (captação) ── */}
        {!jaConcedido && parcelasPrevisao.length > 0 && (
          <View style={s.vencimentosCard}>
            {/* Header row: título + chevron */}
            <TouchableOpacity
              style={s.paymentToggle}
              onPress={() => setShowPrevisao((v) => !v)}
              activeOpacity={0.8}
            >
              <Text style={s.paymentToggleTitle}>Pagamento</Text>
              <Feather name={showPrevisao ? 'chevron-up' : 'chevron-down'} size={18} color={C.inkFaint} />
            </TouchableOpacity>

            {/* Bar section: sempre visível */}
            <View style={s.paymentBarContainer}>
              {/* Row 1: info textual */}
              <View style={s.paymentBarHead}>
                <Text style={s.paymentBarHeadLeft}>
                  {parcelasTotal > 0 ? `${parcelasTotal} ${parcelasTotal === 1 ? 'parcela' : 'parcelas'} ${PAGAMENTOS_LABEL[ciclo]}` : '—'}
                </Text>
                <Text style={s.paymentBarHeadRight}>{pctPago}% pago</Text>
              </View>
              {/* Row 2: barra de progresso */}
              <ThinBar pct={pctPago} context="light" style={s.paymentBarTrack} />
              {/* Row 3: labels */}
              <View style={s.paymentBarFooter}>
                <Text style={s.barFooterLightText}>R$ {formatBRL(Math.round(recebidoValor))} pago</Text>
                <Text style={s.barFooterLightText}>R$ {formatBRL(Math.round(totalComRetorno))} total</Text>
              </View>
            </View>

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

        {/* ── Vencimentos reais (colapsável) ── */}
        {jaConcedido && (
          <View style={s.vencimentosCard}>
            {/* Header row: título + chevron (chevron só aparece se há parcelas para expandir) */}
            {parcelas.length > 0 ? (
              <TouchableOpacity
                style={s.paymentToggle}
                onPress={() => setShowVencimentos((v) => !v)}
                activeOpacity={0.8}
              >
                <Text style={s.paymentToggleTitle}>Pagamento</Text>
                <Feather name={showVencimentos ? 'chevron-up' : 'chevron-down'} size={18} color={C.inkFaint} />
              </TouchableOpacity>
            ) : (
              <View style={s.paymentToggle}>
                <Text style={s.paymentToggleTitle}>Pagamento</Text>
              </View>
            )}

            {/* Bar section: sempre visível */}
            <View style={s.paymentBarContainer}>
              {/* Row 1: info textual */}
              <View style={s.paymentBarHead}>
                <Text style={s.paymentBarHeadLeft}>
                  {parcelasTotal > 0 ? `${parcelasTotal} ${parcelasTotal === 1 ? 'parcela' : 'parcelas'} ${PAGAMENTOS_LABEL[ciclo]}` : '—'}
                </Text>
                <Text style={s.paymentBarHeadRight}>{pctPago}% pago</Text>
              </View>
              {/* Row 2: barra de progresso */}
              <ThinBar pct={pctPago} context="light" style={s.paymentBarTrack} />
              {/* Row 3: labels */}
              <View style={s.paymentBarFooter}>
                <Text style={s.barFooterLightText}>R$ {formatBRL(Math.round(recebidoValor))} pago</Text>
                <Text style={s.barFooterLightText}>R$ {formatBRL(Math.round(totalComRetorno))} total</Text>
              </View>
            </View>

            {parcelas.length > 0 && showVencimentos && (
              <View style={s.expandedContent}>
                {parcelas.map((p) => {
                  const isRecebida = p.status === 'recebida';
                  const isAtrasada = p.status === 'atrasada';
                  return (
                    <View
                      key={p.numero}
                      style={[
                        s.parcelaCard,
                        isAtrasada && s.parcelaCardAtrasada,
                        isRecebida && s.parcelaCardRecebida,
                      ]}
                    >
                      <InstallmentBadge
                        variant={isRecebida ? 'paid' : isAtrasada ? 'overdue' : 'default'}
                        label={String(p.numero)}
                      />
                      <View style={s.parcelaInfo}>
                        <Text style={[s.parcelaLabel, isAtrasada && s.parcelaLabelAtrasada]}>
                          {isRecebida ? 'Recebido em ' : isAtrasada ? 'Venceu em ' : 'Vence em '}
                          {formatData(p.data)}
                        </Text>
                        <Text style={s.parcelaValue}>R$ {formatBRL(Math.round(valorRecebimento))}</Text>
                      </View>
                      <View style={[s.statusTag, isAtrasada && s.statusTagAtrasada]}>
                        {isRecebida ? (
                          <>
                            <Feather name="check" size={14} color={C.inkSoft} />
                            <Text style={s.statusTagText}>Recebido</Text>
                          </>
                        ) : isAtrasada ? (
                          <Text style={[s.statusTagText, { color: C.red }]}>Vencido</Text>
                        ) : (
                          <Text style={s.statusTagText}>A receber</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ── Sobre o tomador ── */}
        <View style={s.tomadorCard}>
          <Text style={s.tomadorTitle}>Sobre o tomador</Text>

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

          <Text style={s.propositoLabel}>Propósito declarado</Text>
          <Text style={s.propositoValue}>{proposito}</Text>
        </View>

        {/* ── Datas (toca → modal de timeline) ── */}
        <TouchableOpacity style={s.datesRow} onPress={() => setShowTimeline(true)} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            {isOferta ? (
              <>
                <Text style={s.dateLabel}>Em captação desde</Text>
                <Text style={s.dateValue}>{formatDataComAno(hoje)}</Text>
              </>
            ) : (
              <>
                <Text style={s.dateLabel}>Investido em</Text>
                <Text style={s.dateValue}>{formatDataComAno(dataInvestimento)}</Text>
              </>
            )}
          </View>
          <View style={s.datesDivider} />
          <View style={{ flex: 1 }}>
            <Text style={s.dateLabel}>
              {vencimentoEhEstimado ? 'Vencimento estimado' : 'Vencimento'}
            </Text>
            <Text style={s.dateValue}>{formatDataComAno(dataVencimentoFinal)}</Text>
          </View>
          <Feather name="chevron-right" size={18} color={C.inkFaint} />
        </TouchableOpacity>

        {/* ── Contrato ID ── */}
        <Text style={s.contratoId}>Contrato Nº {contratoId}</Text>

        {/* ── Ajuda ── */}
        <GhostButton
          label="Precisa de ajuda com esse ativo?"
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
          <Text style={s.modalTitle}>Histórico</Text>
          <TouchableOpacity style={s.modalClose} onPress={() => setShowTimeline(false)}>
            <Feather name="x" size={16} color={C.ink} />
          </TouchableOpacity>
        </View>

        <Timeline events={timelineEvents} />
      </ModalSheet>

      {/* ── Footer fixo: aceitar oferta ── */}
      {isOferta && !aceitou && (
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
  title:  { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },

  heroCard:     { borderRadius: radii.hero, marginHorizontal: spacing[4], marginTop: spacing[4], marginBottom: spacing[4], padding: spacing[6], backgroundColor: C.dark },
  heroTopRow:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  heroEyebrow:  { fontSize: fontSize.sm, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.onDarkSoft },
  heroValue:    { fontFamily: fonts.display, fontSize: fontSize.mega, color: '#fff', letterSpacing: -1.1, lineHeight: 50, marginBottom: 8 },
  heroSign:     { fontSize: 24, fontFamily: fonts.display },
  heroCaption:  { fontSize: fontSize['base+'], color: C.onDarkFaint, fontFamily: fonts.regular, marginBottom: 16 },
  heroDivider:  { height: 1, backgroundColor: C.onDarkBorder, marginBottom: 20 },
  splitRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  splitLabel:   { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.2, color: C.onDarkFaint, textTransform: 'uppercase', marginBottom: 4 },
  splitValue:   { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: '#fff', letterSpacing: -0.3 },

  sliderCard:   { marginHorizontal: spacing[4], marginBottom: spacing[4], borderRadius: radii.card, backgroundColor: C.card, padding: spacing[5], paddingBottom: spacing[4] },
  sliderInCard: { marginTop: spacing[1], marginBottom: spacing[2] },
  barFooter:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  barFooterText: { fontSize: fontSize.xs, color: C.onDarkFaint, fontFamily: fonts.regular },

  datesRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing[4], marginBottom: spacing[4], padding: 14, borderRadius: radii.lg, backgroundColor: C.card },
  datesDivider: { width: 1, height: 30, backgroundColor: C.line },
  dateLabel:    { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.2, color: C.inkFaint, textTransform: 'uppercase', marginBottom: 3 },
  dateValue:    { fontFamily: fonts.display, fontSize: fontSize['base+'], color: C.ink },

  vencimentosCard:      { marginHorizontal: spacing[4], marginBottom: spacing[4], borderRadius: radii.card, backgroundColor: C.card, overflow: 'hidden' },
  paymentToggle:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4] + 2, paddingVertical: spacing[3] + 2 },
  paymentToggleTitle:   { fontSize: fontSize['base+'], fontFamily: fonts.bold, color: C.ink },
  paymentBarContainer:  { paddingHorizontal: spacing[4] + 2, paddingBottom: spacing[4] },
  paymentBarHead:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  paymentBarHeadLeft:   { fontFamily: fonts.display, fontSize: fontSize.lg, color: C.ink },
  paymentBarHeadRight:  { fontFamily: fonts.display, fontSize: fontSize.base, color: C.inkSoft },
  paymentBarTrack:      { marginBottom: 9 },
  paymentBarFooter:     { flexDirection: 'row', justifyContent: 'space-between' },
  expandedContent:      {},
  barFooterLightText:   { fontSize: fontSize.xs, color: C.inkFaint, fontFamily: fonts.regular },
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
  tomadorTitle:    { fontFamily: fonts.display, fontSize: fontSize['md+'], color: C.ink, marginBottom: spacing[4] },
  tomadorGridWrap: { borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: spacing[4], marginBottom: spacing[4] },
  propositoLabel:  { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.2, color: C.inkFaint, textTransform: 'uppercase', marginBottom: 4 },
  propositoValue:  { fontSize: fontSize.base, fontFamily: fonts.regular, color: C.ink, lineHeight: 20 },

  contratoId: { fontSize: fontSize.sm, color: C.inkFaint, fontFamily: fonts.regular, textAlign: 'center', marginTop: spacing[3], marginBottom: spacing[1] },

  footer:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line, paddingHorizontal: spacing[4], paddingTop: spacing[4] },
  footerBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: radii.lg, backgroundColor: C.dark },
  footerBtnText: { fontSize: fontSize['base+'], fontFamily: fonts.bold, color: '#fff' },

  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] + 2 },
  modalTitle:  { fontFamily: fonts.display, fontSize: fontSize.xl, color: C.ink },
  modalClose:  { width: 32, height: 32, borderRadius: radii.md, backgroundColor: C.chipMuted, alignItems: 'center', justifyContent: 'center' },
});
