import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { POSICOES } from '@/data/ativos';
import type { Posicao } from '@/data/ativos';
import { MOCK_OFERTAS } from '@/data/ofertas';
import { CICLO_META, formatBRL, addDays, formatData, formatDataComAno, formatDataHora } from '@/data/loans';

const OFERTA_CICLO_MAP: Record<string, 'diario' | 'semanal' | 'mensal'> = {
  Diário: 'diario', Semanal: 'semanal', Mensal: 'mensal',
};
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import {
  BackButton, StatusBadge, PoolBar, PoolLegend, DetailGrid,
  InstallmentBadge, AlertBanner, GhostButton, ModalSheet,
} from '@/components/ds';
import type { LoanStatus } from '@/components/ds';

const PAGAMENTOS_LABEL: Record<string, string> = {
  diario: 'diários', semanal: 'semanais', mensal: 'mensais',
};

export default function AtivoDetalheScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const isOferta = source === 'oferta';

  // Se vier da tela de ofertas, converte Oferta → Posicao em captação
  const posicao: Posicao | undefined = (() => {
    if (isOferta) {
      const o = MOCK_OFERTAS.find((x) => x.id === Number(id));
      if (!o) return undefined;
      return {
        id:                    o.id,
        contratoId:            o.ofertaId,
        valorInvestido:        o.valor,
        taxaJurosTotal:        o.taxaRetorno,
        prazoDias:             o.prazoDias,
        ciclo:                 OFERTA_CICLO_MAP[o.ciclo],
        status:                'captacao' as const,
        parcelasTotal:         0,
        parcelasRecebidas:     0,
        jaCaptado:             o.jaCaptado,
        valorTotalPedido:      o.valorTotalPedido,
        numCredores:           0,
        risco:                 o.risco,
        tomadorScore:          o.tomadorScore,
        emprestimosAnteriores: o.emprestimosAnteriores,
        valorTotalTomado:      o.valorTotalTomado,
        cidade:                o.cidade,
        proposito:             o.proposito,
      };
    }
    return POSICOES.find((p) => p.id === Number(id));
  })();

  const [showTimeline,    setShowTimeline]    = useState(false);
  const [showVencimentos, setShowVencimentos] = useState(false);
  const [showPrevisao,    setShowPrevisao]    = useState(false);

  if (!posicao) {
    return (
      <View style={[s.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: C.inkFaint, fontFamily: fonts.regular }}>Ativo não encontrado.</Text>
      </View>
    );
  }

  const {
    contratoId, valorInvestido, taxaJurosTotal, prazoDias, ciclo,
    status, parcelasTotal, parcelasRecebidas,
    risco, tomadorScore, emprestimosAnteriores, valorTotalTomado, cidade, proposito,
  } = posicao;

  const cicloMeta      = CICLO_META[ciclo];
  const totalComRetorno = valorInvestido * (1 + taxaJurosTotal / 100);
  const retornoTotal    = totalComRetorno - valorInvestido;

  const jaConcedido    = status !== 'captacao';
  const hoje           = new Date();
  const dataConcessao  = jaConcedido ? addDays(hoje, -(posicao.diasDesdeConcessao ?? 0)) : hoje;
  const dataInvestimento   = addDays(dataConcessao, -2);
  const dataVencimentoFinal = addDays(dataConcessao, prazoDias);

  // Pool bar data
  // Calcula o total combinado primeiro, depois deriva os segmentos — nunca soma arredondamentos individuais
  const pctCaptado    = !jaConcedido && posicao.valorTotalPedido > 0
    ? Math.round((posicao.jaCaptado / posicao.valorTotalPedido) * 100) : 0;
  const pctTotal      = !jaConcedido && posicao.valorTotalPedido > 0
    ? Math.round(((posicao.jaCaptado + valorInvestido) / posicao.valorTotalPedido) * 100) : 0;
  const pctPosClamped = Math.max(0, pctTotal - pctCaptado);

  // Previsão de vencimentos (captação) — datas relativas à concessão
  const parcelasPrevistas = !jaConcedido
    ? Math.round(prazoDias / cicloMeta.dias)
    : 0;
  const parcelasPrevisao = !jaConcedido && parcelasPrevistas > 0
    ? Array.from({ length: parcelasPrevistas }, (_, i) => {
        const numero            = i + 1;
        const diasAposConcessao = numero * cicloMeta.dias;
        return { numero, diasAposConcessao };
      })
    : [];

  // Calcula direto da proporção — evita dividir e multiplicar de volta acumulando erro de ponto flutuante
  // Durante captação usa parcelasPrevistas (derivadas do prazo/ciclo) pois parcelasTotal ainda é 0
  const parcelasRef      = jaConcedido ? parcelasTotal : parcelasPrevistas;
  const valorRecebimento = parcelasRef > 0 ? totalComRetorno / parcelasRef : 0;
  const pctPago          = jaConcedido && parcelasTotal > 0
    ? Math.round((parcelasRecebidas / parcelasTotal) * 100) : 0;
  const recebidoValor    = parcelasTotal > 0 ? totalComRetorno * parcelasRecebidas / parcelasTotal : 0;

  // Vencimentos (ativo/atrasado/quitado) — datas reais
  const parcelas = jaConcedido && parcelasTotal > 0
    ? Array.from({ length: parcelasTotal }, (_, i) => {
        const numero = i + 1;
        const data   = addDays(dataConcessao, numero * cicloMeta.dias);
        let pStatus: 'recebida' | 'atrasada' | 'pendente' = 'pendente';
        if (numero <= parcelasRecebidas) pStatus = 'recebida';
        else if (data < hoje)            pStatus = 'atrasada';
        return { numero, data, status: pStatus };
      })
    : [];

  const parcelasRestantes = parcelasTotal - parcelasRecebidas;
  const saldoRestante     = valorRecebimento * parcelasRestantes;

  // Timeline
  const timelineEvents = [
    { label: 'Investido',          date: dataInvestimento,    done: true },
    { label: 'Captação concluída', date: dataConcessao,       done: jaConcedido },
    status === 'quitado'
      ? { label: 'Quitado',           date: dataVencimentoFinal, done: true }
      : { label: 'Vencimento final',   date: dataVencimentoFinal, done: false },
  ];

  const numeroDoContrato = emprestimosAnteriores === 0 ? 'Primeiro' : `${emprestimosAnteriores + 1}º empréstimo`;

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>

      {/* ── Header fixo ── */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Detalhes do ativo</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Alert: tomador em atraso (topo, antes do hero) ── */}
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
            <Text style={s.heroEyebrow}>Retorno do contrato</Text>
            <StatusBadge status={status as LoanStatus} context="dark" />
          </View>

          <Text style={s.heroValue}>
            <Text style={s.heroSign}>+</Text>{taxaJurosTotal}%
          </Text>
          <Text style={s.heroCaption}>
            Rendimento de R$ {formatBRL(Math.round(retornoTotal))} em {prazoDias} dias
          </Text>

          {/* Split: investido / retorno */}
          <View style={s.splitRow}>
            <View>
              <Text style={s.splitLabel}>Valor investido</Text>
              <Text style={s.splitValue}>R$ {formatBRL(valorInvestido)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.splitLabel}>Retorno</Text>
              <Text style={s.splitValue}>R$ {formatBRL(Math.round(totalComRetorno))}</Text>
            </View>
          </View>

          {/* Pool bar */}
          {!jaConcedido ? (
            <PoolBar
              label="Captação"
              headLeft={`${pctTotal}% captado`}
              headRight={`R$ ${formatBRL(posicao.jaCaptado + valorInvestido)} de R$ ${formatBRL(posicao.valorTotalPedido)}`}
              segments={[
                { pct: pctCaptado,    variant: 'primary' },
                { pct: pctPosClamped, variant: 'secondary' },
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
          ) : (
            <PoolBar
              label="Pagamento"
              headLeft={`${pctPago}% pago`}
              headRight={`R$ ${formatBRL(Math.round(recebidoValor))} de R$ ${formatBRL(Math.round(totalComRetorno))}`}
              segments={[{ pct: pctPago, variant: 'primary' }]}
              context="dark"
              style={{ marginBottom: 20 }}
            />
          )}

          <DetailGrid
            context="dark"
            items={[
              { label: 'Prazo', value: `${prazoDias} dias` },
              { label: 'Ciclo', value: cicloMeta.label, sub: `vencimentos ${PAGAMENTOS_LABEL[ciclo]}` },
            ]}
          />
        </View>

        {/* ── Previsão de vencimentos (captação) ── */}
        {!jaConcedido && parcelasPrevisao.length > 0 && (
          <View style={s.vencimentosCard}>
            <TouchableOpacity
              style={s.sectionToggle}
              onPress={() => setShowPrevisao((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={s.sectionToggleTitle}>Previsão de vencimentos</Text>
                <Text style={s.sectionToggleSummary}>
                  {parcelasPrevistas} pagamentos · R$ {formatBRL(Math.round(valorRecebimento))} cada · A partir da concessão
                </Text>
              </View>
              <Feather
                name={showPrevisao ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={C.inkFaint}
              />
            </TouchableOpacity>

            {showPrevisao && (
              <View>
                <View style={s.previsaoAviso}>
                  <Feather name="info" size={13} color={C.inkFaint} style={{ marginTop: 1 }} />
                  <Text style={s.previsaoAvisoText}>
                    As datas exatas serão definidas na concessão do empréstimo.
                  </Text>
                </View>
                {parcelasPrevisao.map((p) => (
                  <View key={p.numero} style={s.parcelaCard}>
                    <InstallmentBadge variant="default" label={String(p.numero)} />
                    <View style={s.parcelaInfo}>
                      <Text style={s.parcelaLabel}>
                        ~{p.diasAposConcessao} dias após a concessão
                      </Text>
                      <Text style={s.parcelaValue}>R$ {formatBRL(Math.round(valorRecebimento))}</Text>
                    </View>
                    <View style={s.statusTag}>
                      <Text style={[s.statusTagText, s.statusTagPrevisto]}>Previsto</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Vencimentos (colapsável) ── */}
        {jaConcedido && parcelasTotal > 0 && (
          <View style={s.vencimentosCard}>
            <TouchableOpacity
              style={s.sectionToggle}
              onPress={() => setShowVencimentos((v) => !v)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={s.sectionToggleTitle}>Vencimentos</Text>
                <Text style={s.sectionToggleSummary}>
                  {parcelasRecebidas}/{parcelasTotal} recebidos · R$ {formatBRL(Math.round(saldoRestante))} restantes
                </Text>
              </View>
              <Feather
                name={showVencimentos ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={C.inkFaint}
              />
            </TouchableOpacity>

            {showVencimentos && (
              <View>
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
                { label: 'Histórico', value: numeroDoContrato },
                { label: 'Já tomado', value: emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(valorTotalTomado)}` },
                { label: 'Cidade',    value: cidade },
              ]}
            />
          </View>

          <Text style={s.propositoLabel}>Propósito declarado</Text>
          <Text style={s.propositoValue}>{proposito}</Text>
        </View>

        {/* ── Datas (toca → modal de timeline) ── */}
        <TouchableOpacity style={s.datesRow} onPress={() => setShowTimeline(true)} activeOpacity={0.85}>
          <View style={{ flex: 1 }}>
            <Text style={s.dateLabel}>Investido em</Text>
            <Text style={s.dateValue}>{formatDataComAno(dataInvestimento)}</Text>
          </View>
          <View style={s.datesDivider} />
          <View style={{ flex: 1 }}>
            <Text style={s.dateLabel}>Vencimento</Text>
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
        style={{ padding: spacing[5], paddingTop: spacing[4] }}
      >
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>Histórico do ativo</Text>
          <TouchableOpacity style={s.modalClose} onPress={() => setShowTimeline(false)}>
            <Feather name="x" size={16} color={C.ink} />
          </TouchableOpacity>
        </View>

        {timelineEvents.map((event, i) => (
          <View key={event.label} style={s.timelineRow}>
            {i < timelineEvents.length - 1 && <View style={s.timelineLine} />}
            <View style={[s.timelineDot, !event.done && s.timelineDotPending]} />
            <View style={{ flex: 1 }}>
              <Text style={[s.timelineLabel, !event.done && s.timelineLabelPending]}>
                {event.label}
              </Text>
              <Text style={s.timelineDate}>
                {event.done
                  ? formatDataHora(event.date)
                  : formatData(event.date)}
              </Text>
            </View>
          </View>
        ))}
      </ModalSheet>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingHorizontal: spacing[5], paddingBottom: spacing[3] },
  title:  { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },

  // Hero dark card
  heroCard:     { borderRadius: radii.hero, marginHorizontal: spacing[4], marginTop: spacing[4], marginBottom: spacing[4], padding: spacing[6], backgroundColor: C.dark },
  heroTopRow:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  heroEyebrow:  { fontSize: fontSize.sm, fontFamily: fonts.semibold, letterSpacing: 0.3, color: C.onDarkSoft },
  heroValue:    { fontFamily: fonts.display, fontSize: fontSize.mega, color: '#fff', letterSpacing: -1.1, lineHeight: 50, marginBottom: 8 },
  heroSign:     { fontSize: 24, fontFamily: fonts.display },
  heroCaption:  { fontSize: fontSize['base+'], color: C.onDarkFaint, fontFamily: fonts.regular, marginBottom: 20 },
  splitRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  splitLabel:   { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.2, color: C.onDarkFaint, textTransform: 'uppercase', marginBottom: 4 },
  splitValue:   { fontFamily: fonts.display, fontSize: fontSize['2xl'], color: '#fff', letterSpacing: -0.3 },

  // Dates row
  datesRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: spacing[4], marginBottom: spacing[4], padding: 14, borderRadius: radii.lg, backgroundColor: C.card },
  datesDivider: { width: 1, height: 30, backgroundColor: C.line },
  dateLabel:    { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.2, color: C.inkFaint, textTransform: 'uppercase', marginBottom: 3 },
  dateValue:    { fontFamily: fonts.display, fontSize: fontSize['base+'], color: C.ink },

  // Vencimentos collapsible card
  vencimentosCard:      { marginHorizontal: spacing[4], marginBottom: spacing[4], borderRadius: radii.card, backgroundColor: C.card, overflow: 'hidden' },
  sectionToggle:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4] + 2 },
  sectionToggleTitle:   { fontFamily: fonts.display, fontSize: fontSize['md+'], color: C.ink, marginBottom: 3 },
  sectionToggleSummary: { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular },
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

  // Previsão de vencimentos
  previsaoAviso:        { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginHorizontal: spacing[4], marginBottom: spacing[2], marginTop: -2 },
  previsaoAvisoText:    { flex: 1, fontSize: fontSize.xs, color: C.inkFaint, fontFamily: fonts.regular, lineHeight: 16 },

  // Tomador card
  tomadorCard:     { marginHorizontal: spacing[4], marginBottom: spacing[4], borderRadius: radii.card, backgroundColor: C.card, padding: spacing[5] },
  tomadorTitle:    { fontFamily: fonts.display, fontSize: fontSize['md+'], color: C.ink, marginBottom: spacing[4] },
  tomadorGridWrap: { borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: spacing[4], marginBottom: spacing[4] },
  propositoLabel:  { fontSize: fontSize.xs, fontFamily: fonts.semibold, letterSpacing: 0.2, color: C.inkFaint, textTransform: 'uppercase', marginBottom: 4 },
  propositoValue:  { fontSize: fontSize.base, fontFamily: fonts.regular, color: C.ink, lineHeight: 20 },

  // Contrato ID
  contratoId: { fontSize: fontSize.sm, color: C.inkFaint, fontFamily: fonts.regular, textAlign: 'center', marginTop: spacing[3], marginBottom: spacing[1] },

  // Timeline modal
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] + 2 },
  modalTitle:  { fontFamily: fonts.display, fontSize: fontSize.xl, color: C.ink },
  modalClose:  { width: 32, height: 32, borderRadius: radii.md, backgroundColor: C.chipMuted, alignItems: 'center', justifyContent: 'center' },
  timelineRow:          { flexDirection: 'row', gap: 14, paddingBottom: spacing[4] + 2, position: 'relative' },
  timelineLine:         { position: 'absolute', left: 4, top: 14, bottom: -4, width: 2, backgroundColor: C.line },
  timelineDot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: C.ink, flexShrink: 0, marginTop: 4, zIndex: 1 },
  timelineDotPending:   { backgroundColor: C.line },
  timelineLabel:        { fontSize: fontSize.base, fontFamily: fonts.bold, color: C.ink, marginBottom: 2 },
  timelineLabelPending: { color: C.inkFaint, fontFamily: fonts.semibold },
  timelineDate:         { fontSize: fontSize['sm+'], color: C.inkSoft, fontFamily: fonts.regular },
});
