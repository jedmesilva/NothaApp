import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type NotifKind = 'vencimento' | 'transferencia' | 'deposito' | 'oferta' | 'emprestimo' | 'conta';

interface Notificacao {
  id: string;
  kind: NotifKind;
  titulo: string;
  descricao: string;
  hora: string;
  lida: boolean;
  rota?: string;
}

interface Secao {
  titulo: string;
  data: Notificacao[];
}

// ---------------------------------------------------------------------------
// Dados mock
// ---------------------------------------------------------------------------
const NOTIFICACOES_MOCK: Secao[] = [
  {
    titulo: 'Hoje',
    data: [
      {
        id: '1',
        kind: 'vencimento',
        titulo: 'Vencimento em 2 dias',
        descricao: 'Sua parcela de R$ 276 vence na quinta-feira. Evite juros pagando antes do prazo.',
        hora: '09:14',
        lida: false,
        rota: '/(tabs)',
      },
      {
        id: '2',
        kind: 'transferencia',
        titulo: 'Saque realizado',
        descricao: 'R$ 1.500 enviados para rafael@notha.com.br via Pix com sucesso.',
        hora: '08:41',
        lida: false,
        rota: '/saque-comprovante',
      },
    ],
  },
  {
    titulo: 'Esta semana',
    data: [
      {
        id: '3',
        kind: 'oferta',
        titulo: 'Nova oferta disponível',
        descricao: 'Fundo Notha Renda Fixa II está captando. Taxa de 14,2% a.a. com liquidez diária.',
        hora: 'Ter 10:30',
        lida: false,
        rota: '/(tabs)/ofertas',
      },
      {
        id: '4',
        kind: 'deposito',
        titulo: 'Depósito recebido',
        descricao: 'R$ 3.000 foram creditados na sua conta via Pix.',
        hora: 'Seg 16:05',
        lida: true,
      },
      {
        id: '5',
        kind: 'emprestimo',
        titulo: 'Empréstimo aprovado',
        descricao: 'Seu empréstimo de R$ 8.500 foi aprovado e está disponível para saque.',
        hora: 'Seg 09:22',
        lida: true,
        rota: '/(tabs)',
      },
    ],
  },
  {
    titulo: 'Anteriores',
    data: [
      {
        id: '6',
        kind: 'vencimento',
        titulo: 'Parcela paga com sucesso',
        descricao: 'Recebemos o pagamento de R$ 276 referente ao empréstimo Pessoal.',
        hora: '14 jul',
        lida: true,
      },
      {
        id: '7',
        kind: 'conta',
        titulo: 'Documento solicitado',
        descricao: 'Para continuar usando a conta, envie um comprovante de residência atualizado.',
        hora: '10 jul',
        lida: true,
        rota: '/conta',
      },
      {
        id: '8',
        kind: 'oferta',
        titulo: 'Oferta encerrada',
        descricao: 'Fundo Notha Crédito I atingiu a meta de captação e foi encerrado.',
        hora: '7 jul',
        lida: true,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers visuais por tipo
// ---------------------------------------------------------------------------
const KIND_META: Record<NotifKind, { icon: string; urgente: boolean }> = {
  vencimento:    { icon: 'clock',          urgente: true  },
  transferencia: { icon: 'arrow-up-right', urgente: false },
  deposito:      { icon: 'arrow-down-left',urgente: false },
  oferta:        { icon: 'trending-up',    urgente: false },
  emprestimo:    { icon: 'check-circle',   urgente: false },
  conta:         { icon: 'user',           urgente: false },
};

// ---------------------------------------------------------------------------
// Componente de item
// ---------------------------------------------------------------------------
function NotifItem({
  item,
  onPress,
  onMarcarLida,
}: {
  item: Notificacao;
  onPress: () => void;
  onMarcarLida: (id: string) => void;
}) {
  const meta = KIND_META[item.kind];

  return (
    <TouchableOpacity
      style={[s.item, !item.lida && s.itemNaoLido]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      {/* Ícone */}
      <View style={[s.iconWrap, meta.urgente && s.iconWrapUrgente]}>
        <Feather
          name={meta.icon as any}
          size={16}
          color={meta.urgente ? C.amber : C.ink}
        />
      </View>

      {/* Conteúdo */}
      <View style={s.itemBody}>
        <View style={s.itemTopo}>
          <Text style={[s.itemTitulo, !item.lida && s.itemTituloNaoLido]} numberOfLines={1}>
            {item.titulo}
          </Text>
          <Text style={s.itemHora}>{item.hora}</Text>
        </View>
        <Text style={s.itemDesc} numberOfLines={2}>{item.descricao}</Text>
      </View>

      {/* Bolinha de não lido */}
      {!item.lida && <View style={s.dot} />}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Tela principal
// ---------------------------------------------------------------------------
export default function NotificacoesScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const [secoes, setSecoes] = useState<Secao[]>(NOTIFICACOES_MOCK);

  const totalNaoLidas = secoes.flatMap((s) => s.data).filter((n) => !n.lida).length;

  const marcarTodasLidas = () => {
    setSecoes((prev) =>
      prev.map((sec) => ({
        ...sec,
        data: sec.data.map((n) => ({ ...n, lida: true })),
      }))
    );
  };

  const marcarLida = (id: string) => {
    setSecoes((prev) =>
      prev.map((sec) => ({
        ...sec,
        data: sec.data.map((n) => (n.id === id ? { ...n, lida: true } : n)),
      }))
    );
  };

  const handlePress = (item: Notificacao) => {
    marcarLida(item.id);
    if (item.rota) router.push(item.rota as any);
  };

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Notificações</Text>
        {totalNaoLidas > 0 && (
          <TouchableOpacity onPress={marcarTodasLidas} activeOpacity={0.7} style={s.lerTudoBtn}>
            <Text style={s.lerTudoText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contador de não lidas */}
      {totalNaoLidas > 0 && (
        <View style={s.badgeRow}>
          <View style={s.badge}>
            <Text style={s.badgeText}>
              {totalNaoLidas} não {totalNaoLidas === 1 ? 'lida' : 'lidas'}
            </Text>
          </View>
        </View>
      )}

      <SectionList
        sections={secoes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={s.secaoTitulo}>{section.titulo}</Text>
        )}
        renderItem={({ item, section, index }) => {
          const isLast = index === section.data.length - 1;
          return (
            <View style={[s.itemWrap, isLast && s.itemWrapLast]}>
              <NotifItem
                item={item}
                onPress={() => handlePress(item)}
                onMarcarLida={marcarLida}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.vazio}>
            <View style={s.vazioIcon}>
              <Feather name="bell-off" size={26} color={C.inkFaint} />
            </View>
            <Text style={s.vazioTitulo}>Tudo em dia</Text>
            <Text style={s.vazioDesc}>Nenhuma notificação por aqui ainda.</Text>
          </View>
        }
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: fontSize['3xl'],
    color: C.ink,
    letterSpacing: -0.2,
  },
  lerTudoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    backgroundColor: C.chipUrgent,
  },
  lerTudoText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semibold,
    color: C.ink,
  },

  badgeRow: {
    paddingHorizontal: spacing[5],
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: C.dark,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    color: '#fff',
    letterSpacing: 0.2,
  },

  secaoTitulo: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: C.inkFaint,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingHorizontal: spacing[5],
    paddingTop: 22,
    paddingBottom: 10,
  },

  itemWrap: {
    marginHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  itemWrapLast: {
    borderBottomWidth: 0,
    marginBottom: 4,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    paddingVertical: 14,
    paddingHorizontal: spacing[4],
    backgroundColor: C.card,
  },
  itemNaoLido: {
    backgroundColor: '#FAFAFA',
  },

  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: C.chipUrgent,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  iconWrapUrgente: {
    backgroundColor: C.amberBg,
  },

  itemBody: { flex: 1 },
  itemTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: spacing[2],
    marginBottom: 4,
  },
  itemTitulo: {
    flex: 1,
    fontSize: fontSize['base+'],
    fontFamily: fonts.semibold,
    color: C.inkSoft,
  },
  itemTituloNaoLido: {
    color: C.ink,
  },
  itemHora: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: C.inkFaint,
    flexShrink: 0,
  },
  itemDesc: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: C.inkSoft,
    lineHeight: 18,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.ink,
    marginTop: 5,
    flexShrink: 0,
  },

  // Estado vazio
  vazio: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing[8],
    gap: spacing[2],
  },
  vazioIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  vazioTitulo: {
    fontFamily: fonts.display,
    fontSize: fontSize['2xl'],
    color: C.ink,
    letterSpacing: -0.2,
  },
  vazioDesc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: C.inkSoft,
    textAlign: 'center',
  },
});
