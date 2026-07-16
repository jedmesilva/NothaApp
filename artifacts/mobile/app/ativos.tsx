import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const C = {
  bg: '#F4F5F7',
  card: '#FFFFFF',
  dark: '#15151D',
  ink: '#15151D',
  inkSoft: '#6C707A',
  inkFaint: '#A2A6AF',
  line: '#EBEBF0',
  chipBg: '#F4F5F7',
  overlay: 'rgba(21,21,29,0.44)',
  red: '#C0392B',
  redBg: '#FBEAE8',
};

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const STATUS_META: Record<string, { label: string; icon: string; bg: string; color: string; borderColor?: string; borderStyle?: string }> = {
  captacao: { label: 'Em captação', icon: 'clock', bg: C.chipBg, color: C.inkSoft },
  ativo: { label: 'Ativo', icon: 'zap', bg: C.dark, color: '#fff' },
  atrasado: { label: 'Atrasado', icon: 'alert-triangle', bg: C.redBg, color: C.red },
  quitado: { label: 'Quitado', icon: 'check-circle', bg: 'transparent', color: C.inkFaint },
};

const CICLO_META: Record<string, { parcelasLabel: string }> = {
  diario: { parcelasLabel: 'diárias' },
  semanal: { parcelasLabel: 'semanais' },
  mensal: { parcelasLabel: 'mensais' },
};

const posicoes = [
  {
    id: 1, contratoId: 'EMP-2026-30291', valorInvestido: 900, taxaJurosTotal: 18,
    prazoDias: 45, ciclo: 'semanal', status: 'captacao',
    jaCaptado: 3100, valorTotalPedido: 5000, numCredores: 14,
    risco: 'Médio', tomadorScore: 'B', emprestimosAnteriores: 3, valorTotalTomado: 12400,
    parcelasTotal: 0, parcelasRecebidas: 0,
  },
  {
    id: 2, contratoId: 'EMP-2026-90214', valorInvestido: 2000, taxaJurosTotal: 22,
    prazoDias: 90, ciclo: 'mensal', status: 'ativo',
    jaCaptado: 0, valorTotalPedido: 0, numCredores: 0,
    parcelasTotal: 3, parcelasRecebidas: 1, proximaData: '4 de agosto',
    risco: 'Alto', tomadorScore: 'C', emprestimosAnteriores: 1, valorTotalTomado: 3000,
  },
  {
    id: 3, contratoId: 'EMP-2026-11875', valorInvestido: 1200, taxaJurosTotal: 15,
    prazoDias: 30, ciclo: 'mensal', status: 'atrasado',
    jaCaptado: 0, valorTotalPedido: 0, numCredores: 0,
    parcelasTotal: 1, parcelasRecebidas: 0, diasAtraso: 5,
    risco: 'Médio', tomadorScore: 'B', emprestimosAnteriores: 2, valorTotalTomado: 4100,
  },
  {
    id: 4, contratoId: 'EMP-2026-56002', valorInvestido: 500, taxaJurosTotal: 10,
    prazoDias: 15, ciclo: 'diario', status: 'quitado',
    jaCaptado: 0, valorTotalPedido: 0, numCredores: 0,
    parcelasTotal: 15, parcelasRecebidas: 15,
    risco: 'Baixo', tomadorScore: 'A', emprestimosAnteriores: 6, valorTotalTomado: 28500,
  },
];

const FILTERS = [
  { key: 'todas', label: 'Todos' },
  { key: 'ativo', label: 'Ativos' },
  { key: 'atrasado', label: 'Atrasados' },
  { key: 'captacao', label: 'Em captação' },
  { key: 'quitado', label: 'Quitados' },
];

const RISCOS = [
  { key: 'todos', label: 'Todos os riscos' },
  { key: 'Baixo', label: 'Baixo' },
  { key: 'Médio', label: 'Médio' },
  { key: 'Alto', label: 'Alto' },
];

export default function AtivosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const [activeFilter, setActiveFilter] = useState('todas');
  const [riscoFilter, setRiscoFilter] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [draftFilter, setDraftFilter] = useState('todas');
  const [draftRisco, setDraftRisco] = useState('todos');

  const filtersActive = activeFilter !== 'todas' || riscoFilter !== 'todos';

  const filtered = posicoes.filter((p) => {
    const statusOk = activeFilter === 'todas' || p.status === activeFilter;
    const riscoOk = riscoFilter === 'todos' || p.risco === riscoFilter;
    const buscaOk = busca.trim() === '' || p.contratoId.toLowerCase().includes(busca.trim().toLowerCase());
    return statusOk && riscoOk && buscaOk;
  });

  const openModal = () => {
    setDraftFilter(activeFilter);
    setDraftRisco(riscoFilter);
    setModalOpen(true);
  };

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Feather name="arrow-left" size={18} color={C.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Ativos</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Feather name="search" size={17} color={C.inkFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por número do contrato"
            placeholderTextColor={C.inkFaint}
            value={busca}
            onChangeText={setBusca}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, filtersActive && styles.filterBtnActive]}
          onPress={openModal}
          activeOpacity={0.8}
        >
          <Feather name="sliders" size={18} color={filtersActive ? '#fff' : C.ink} />
          {filtersActive && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        {filtered.length === 0 && (
          <Text style={styles.emptyState}>Nenhuma posição nessa categoria.</Text>
        )}

        {filtered.map((p) => {
          const meta = STATUS_META[p.status];
          const ciclo = CICLO_META[p.ciclo];
          const totalComRetorno = p.valorInvestido * (1 + p.taxaJurosTotal / 100);
          const retornoTotal = totalComRetorno - p.valorInvestido;
          const isAtrasado = p.status === 'atrasado';
          const isCaptacao = p.status === 'captacao';
          const isQuitado = p.status === 'quitado';

          return (
            <View
              key={p.id}
              style={[
                styles.posCard,
                isAtrasado && styles.posCardAtrasado,
                isCaptacao && styles.posCardCaptacao,
              ]}
            >
              <View style={styles.posTopRow}>
                <Text style={styles.eyebrow}>Retorno do contrato</Text>
                <View style={[styles.badge, { backgroundColor: meta.bg, borderWidth: isQuitado ? 1 : 0, borderColor: C.line }]}>
                  <Feather name={meta.icon as any} size={13} color={meta.color} />
                  <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>

              <Text style={styles.heroValue}>
                <Text style={styles.heroSign}>+</Text>{p.taxaJurosTotal}%
              </Text>
              <Text style={styles.heroCaption}>
                Rendimento de R$ {formatBRL(Math.round(retornoTotal))} em {p.prazoDias} dias
              </Text>

              <View style={styles.splitRow}>
                <View>
                  <Text style={styles.splitLabel}>Valor investido</Text>
                  <Text style={styles.splitValue}>R$ {formatBRL(p.valorInvestido)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.splitLabel}>Retorno</Text>
                  <Text style={styles.splitValue}>R$ {formatBRL(Math.round(retornoTotal))}</Text>
                </View>
              </View>

              {/* Pool / Progress */}
              {isCaptacao ? (
                <View style={{ marginBottom: 18 }}>
                  <Text style={styles.poolLabel}>Captação do pedido</Text>
                  {(() => {
                    const pctCaptado = Math.round((p.jaCaptado / p.valorTotalPedido) * 100);
                    const pctPos = Math.round((p.valorInvestido / p.valorTotalPedido) * 100);
                    const pctPosClamped = Math.min(pctPos, 100 - pctCaptado);
                    return (
                      <>
                        <View style={styles.poolTopRow}>
                          <Text style={styles.poolPercent}>{pctCaptado + pctPos}% captado</Text>
                          <Text style={styles.poolValue}>
                            R$ {formatBRL(p.jaCaptado + p.valorInvestido)} de R$ {formatBRL(p.valorTotalPedido)}
                          </Text>
                        </View>
                        <View style={styles.poolTrack}>
                          <View style={[styles.poolSegDark, { width: `${pctCaptado}%` as any }]} />
                          <View style={[styles.poolSegStripe, { width: `${pctPosClamped}%` as any }]} />
                        </View>
                      </>
                    );
                  })()}
                </View>
              ) : (
                <View style={{ marginBottom: 18 }}>
                  <Text style={styles.poolLabel}>Pagamento do contrato</Text>
                  {(() => {
                    const valParcela = totalComRetorno / p.parcelasTotal;
                    const recebido = valParcela * p.parcelasRecebidas;
                    const pctRecebido = Math.round((recebido / totalComRetorno) * 100);
                    return (
                      <>
                        <View style={styles.poolTopRow}>
                          <Text style={styles.poolPercent}>{pctRecebido}% pago</Text>
                          <Text style={styles.poolValue}>
                            R$ {formatBRL(Math.round(recebido))} de R$ {formatBRL(Math.round(totalComRetorno))}
                          </Text>
                        </View>
                        <View style={styles.poolTrack}>
                          <View style={[styles.poolSegDark, { width: `${pctRecebido}%` as any }]} />
                        </View>
                        <Text style={[styles.poolCaption, isAtrasado && { color: C.red, fontFamily: 'Inter_700Bold' }]}>
                          {isAtrasado
                            ? `atrasado há ${(p as any).diasAtraso} dias`
                            : isQuitado
                            ? 'contrato encerrado'
                            : `próximo em ${(p as any).proximaData}`}
                        </Text>
                      </>
                    );
                  })()}
                </View>
              )}

              <View style={styles.detailsGrid}>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Prazo</Text>
                  <Text style={styles.detailValue}>{p.prazoDias} dias</Text>
                  <Text style={styles.detailSub}>parcelas {ciclo.parcelasLabel}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Risco</Text>
                  <Text style={styles.detailValue}>{p.risco}</Text>
                  <Text style={styles.detailSub}>score {p.tomadorScore}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Histórico</Text>
                  <Text style={styles.detailValue}>
                    {p.emprestimosAnteriores === 0 ? 'Primeiro' : `${p.emprestimosAnteriores + 1}º empréstimo`}
                  </Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Já tomado</Text>
                  <Text style={styles.detailValue}>
                    {p.emprestimosAnteriores === 0 ? '—' : `R$ ${formatBRL(p.valorTotalTomado)}`}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalOpen(false)}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalSheet, { paddingBottom: Platform.OS === 'web' ? 28 : insets.bottom + 28 }]}>
              <View style={styles.grabber} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtrar posições</Text>
                <TouchableOpacity style={styles.modalClose} onPress={() => setModalOpen(false)}>
                  <Feather name="x" size={16} color={C.ink} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSectionLabel}>Status</Text>
              <View style={styles.pillsWrap}>
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.pill, draftFilter === f.key && styles.pillActive]}
                    onPress={() => setDraftFilter(f.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillText, draftFilter === f.key && styles.pillTextActive]}>{f.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalSectionLabel}>Risco</Text>
              <View style={styles.pillsWrap}>
                {RISCOS.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.pill, draftRisco === r.key && styles.pillActive]}
                    onPress={() => setDraftRisco(r.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillText, draftRisco === r.key && styles.pillTextActive]}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.footerBtnGhost}
                  onPress={() => { setDraftFilter('todas'); setDraftRisco('todos'); }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.footerBtnGhostText}>Limpar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerBtnSolid}
                  onPress={() => { setActiveFilter(draftFilter); setRiscoFilter(draftRisco); setModalOpen(false); }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.footerBtnSolidText}>Aplicar filtros</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 4 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: C.ink, letterSpacing: -0.2 },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, marginTop: 16, marginBottom: 4 },
  searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 14, backgroundColor: C.card },
  searchInput: { flex: 1, fontSize: 14.5, color: C.ink, fontFamily: 'Inter_400Regular', padding: 0 },
  filterBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  filterBtnActive: { backgroundColor: C.dark },
  filterBadge: { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: C.ink, borderWidth: 2, borderColor: C.card },

  emptyState: { textAlign: 'center', paddingVertical: 60, color: C.inkFaint, fontSize: 14, fontFamily: 'Inter_400Regular' },

  posCard: { borderRadius: 22, backgroundColor: C.card, padding: 22 },
  posCardAtrasado: { borderWidth: 1.5, borderColor: C.red },
  posCardCaptacao: { borderWidth: 1.5, borderColor: C.inkFaint, borderStyle: 'dashed' },
  posTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  eyebrow: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3, color: C.inkFaint },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 12, fontFamily: 'Inter_700Bold' },

  heroValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 44, color: C.ink, letterSpacing: -1.1, lineHeight: 50, marginBottom: 8 },
  heroSign: { fontSize: 24, fontFamily: 'SpaceGrotesk_700Bold' },
  heroCaption: { fontSize: 13.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginBottom: 18 },

  splitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  splitLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 4 },
  splitValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 21, color: C.ink, letterSpacing: -0.3 },

  poolLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 6 },
  poolTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  poolPercent: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 15, color: C.ink },
  poolValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: C.inkSoft },
  poolTrack: { height: 14, borderRadius: 999, backgroundColor: C.line, overflow: 'hidden', marginBottom: 9, flexDirection: 'row' },
  poolSegDark: { height: '100%', backgroundColor: C.ink },
  poolSegStripe: { height: '100%', backgroundColor: C.inkFaint },
  poolCaption: { fontSize: 12.5, color: C.inkSoft, fontFamily: 'Inter_400Regular', marginTop: 2 },

  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 18, rowGap: 16, columnGap: 12 },
  detailBlock: { width: '46%' },
  detailLabel: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.2, textTransform: 'uppercase', marginBottom: 3 },
  detailValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: C.ink },
  detailSub: { fontSize: 11.5, color: C.inkFaint, fontFamily: 'Inter_400Regular', marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingTop: 14 },
  grabber: { width: 36, height: 4, borderRadius: 999, backgroundColor: C.line, alignSelf: 'center', marginBottom: 18 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 19, color: C.ink, letterSpacing: -0.3 },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  modalSectionLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 0.3, textTransform: 'uppercase', color: C.inkFaint, marginBottom: 10 },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 26 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  pillActive: { backgroundColor: C.dark, borderColor: C.dark },
  pillText: { fontSize: 13.5, fontFamily: 'Inter_600SemiBold', color: C.inkSoft },
  pillTextActive: { color: '#fff' },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 6 },
  footerBtnGhost: { flex: 1, paddingVertical: 15, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: C.line },
  footerBtnGhostText: { fontSize: 14.5, fontFamily: 'Inter_700Bold', color: C.ink },
  footerBtnSolid: { flex: 2, paddingVertical: 15, borderRadius: 14, alignItems: 'center', backgroundColor: C.dark },
  footerBtnSolidText: { fontSize: 14.5, fontFamily: 'Inter_700Bold', color: '#fff' },
});
