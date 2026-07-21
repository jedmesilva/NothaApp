import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { formatBRL } from '@/data/loans';

type StatusTransferencia = 'pendente' | 'concluida' | 'recusada' | 'cancelada';

const STATUS_META: Record<StatusTransferencia, {
  icon: string;
  label: string;
  desc: string;
  iconBg: string;
  iconColor: string;
}> = {
  pendente: {
    icon: 'clock',
    label: 'Transferência pendente',
    desc: 'Seu saque foi enviado e está sendo processado. Em geral leva até 30 minutos.',
    iconBg: C.chipUrgent,
    iconColor: C.ink,
  },
  concluida: {
    icon: 'check-circle',
    label: 'Transferência concluída',
    desc: 'O dinheiro já foi enviado para a chave Pix informada.',
    iconBg: C.chipUrgent,
    iconColor: C.ink,
  },
  recusada: {
    icon: 'alert-circle',
    label: 'Transferência recusada',
    desc: 'O banco destino recusou a transferência. Verifique a chave Pix e tente novamente.',
    iconBg: C.redBg,
    iconColor: C.red,
  },
  cancelada: {
    icon: 'x-circle',
    label: 'Transferência cancelada',
    desc: 'Esta transferência foi cancelada. Seu saldo foi estornado.',
    iconBg: C.redBg,
    iconColor: C.red,
  },
};

function formatarData(date: Date) {
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function SaqueComprovanteScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;
  const params = useLocalSearchParams<{ valor: string; chave: string }>();

  const valorCentavos = Number(params.valor ?? 0);
  const valorReais    = valorCentavos / 100;
  const chave         = params.chave ?? '';
  const dataHora      = formatarData(new Date());

  // Simula transição de pendente → concluída em 3s (demo)
  const [status, setStatus] = useState<StatusTransferencia>('pendente');
  useEffect(() => {
    const t = setTimeout(() => setStatus('concluida'), 3000);
    return () => clearTimeout(t);
  }, []);

  const meta = STATUS_META[status];

  const handleVoltar = () => router.push('/(tabs)');

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={{ width: 38 }} />
        <Text style={s.title}>Comprovante</Text>
        <TouchableOpacity onPress={handleVoltar} activeOpacity={0.7} style={s.fecharBtn}>
          <Feather name="x" size={18} color={C.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Status card */}
        <View style={s.statusCard}>
          <View style={[s.statusIcon, { backgroundColor: meta.iconBg }]}>
            <Feather name={meta.icon as any} size={28} color={meta.iconColor} />
          </View>
          <Text style={s.statusLabel}>{meta.label}</Text>
          <Text style={s.statusDesc}>{meta.desc}</Text>

          {status === 'pendente' && (
            <View style={s.loadingRow}>
              <View style={s.loadingDot} />
              <View style={[s.loadingDot, { opacity: 0.5 }]} />
              <View style={[s.loadingDot, { opacity: 0.2 }]} />
            </View>
          )}
        </View>

        {/* Detalhes */}
        <View style={s.detalhesCard}>
          <Text style={s.detalhesTitulo}>Detalhes da transferência</Text>

          <DetailRow label="Valor" value={`R$ ${formatBRL(valorReais)}`} />
          <DetailRow label="Chave Pix destino" value={chave} mono />
          <DetailRow label="Data e hora" value={dataHora} />
          <DetailRow label="Tipo" value="Saque via Pix" />
          <DetailRow
            label="Status"
            value={
              status === 'pendente'  ? 'Pendente'   :
              status === 'concluida' ? 'Concluída'  :
              status === 'recusada'  ? 'Recusada'   : 'Cancelada'
            }
            last
          />
        </View>

        {/* Aviso se recusada/cancelada */}
        {(status === 'recusada' || status === 'cancelada') && (
          <View style={s.avisoCard}>
            <Feather name="info" size={14} color={C.red} />
            <Text style={s.avisoText}>
              {status === 'recusada'
                ? 'Seu saldo não foi debitado. Tente novamente com outra chave Pix.'
                : 'Seu saldo foi estornado e já está disponível na conta.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        {(status === 'recusada' || status === 'cancelada') ? (
          <View style={s.ctaDouble}>
            <TouchableOpacity style={s.ctaBtnGhost} onPress={handleVoltar} activeOpacity={0.75}>
              <Text style={s.ctaGhostText}>Voltar ao início</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.ctaBtn, { flex: 2 }]}
              onPress={() => router.replace('/saque-valor' as any)}
              activeOpacity={0.85}
            >
              <Text style={s.ctaText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.ctaBtn} onPress={handleVoltar} activeOpacity={0.85}>
            <Text style={s.ctaText}>Ir para o início</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function DetailRow({
  label, value, mono = false, last = false,
}: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <View style={[dr.row, last && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
      <Text style={dr.label}>{label}</Text>
      <Text style={[dr.value, mono && dr.mono]} numberOfLines={1} ellipsizeMode="middle">
        {value}
      </Text>
    </View>
  );
}

const dr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    gap: spacing[4],
  },
  label: { fontSize: fontSize['base+'], fontFamily: fonts.regular, color: C.inkSoft, flexShrink: 0 },
  value: { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.ink, flex: 1, textAlign: 'right' },
  mono:  { fontFamily: fonts.regular, fontSize: fontSize.sm },
});

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  title: { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },
  fecharBtn: {
    width: 38, height: 38,
    borderRadius: radii.xl,
    backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center',
  },

  statusCard: {
    borderRadius: radii.cardLg,
    margin: spacing[4],
    padding: spacing[6],
    backgroundColor: C.card,
    alignItems: 'center',
  },
  statusIcon: {
    width: 64, height: 64,
    borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing[4],
  },
  statusLabel: {
    fontFamily: fonts.display,
    fontSize: fontSize['2xl'],
    color: C.ink,
    textAlign: 'center',
    marginBottom: spacing[2],
    letterSpacing: -0.2,
  },
  statusDesc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: C.inkSoft,
    textAlign: 'center',
    lineHeight: 21,
  },
  loadingRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing[4],
  },
  loadingDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: C.inkFaint,
  },

  detalhesCard: {
    borderRadius: radii.cardLg,
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: C.card,
  },
  detalhesTitulo: {
    fontFamily: fonts.bold,
    fontSize: fontSize['base+'],
    color: C.ink,
    marginBottom: spacing[2],
  },

  avisoCard: {
    flexDirection: 'row',
    gap: spacing[2],
    alignItems: 'flex-start',
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    padding: spacing[4],
    backgroundColor: C.redBg,
    borderRadius: radii.lg,
  },
  avisoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: C.red,
    lineHeight: 18,
  },

  ctaBar: {
    paddingHorizontal: spacing[4],
    paddingTop: 14,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  ctaDouble: { flexDirection: 'row', gap: spacing[3] },
  ctaBtn: {
    flex: 1,
    backgroundColor: C.dark,
    borderRadius: radii.xl,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaBtnGhost: {
    flex: 1,
    borderRadius: radii.xl,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: C.chipUrgent,
  },
  ctaText: { fontFamily: fonts.bold, fontSize: fontSize['lg+'], color: '#fff', letterSpacing: 0.1 },
  ctaGhostText: { fontFamily: fonts.bold, fontSize: fontSize['lg+'], color: C.ink, letterSpacing: 0.1 },
});
