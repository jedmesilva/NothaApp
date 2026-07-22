import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';

// ---------------------------------------------------------------------------
// Dados mock do usuário
// ---------------------------------------------------------------------------
const USUARIO = {
  nome: 'Rafael Mendes',
  email: 'rafael@notha.com.br',
  membroDesde: 'março de 2023',
  iniciais: 'R',
};

// ---------------------------------------------------------------------------
// Selos — estrutura preparada para implementação futura
// ---------------------------------------------------------------------------
type SeloStatus = 'conquistado' | 'bloqueado';
interface Selo {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  status: SeloStatus;
}

const SELOS: Selo[] = [
  { id: '1', titulo: 'Primeiro depósito', descricao: 'Realizou o primeiro depósito na conta', icone: 'arrow-down-circle', status: 'conquistado' },
  { id: '2', titulo: 'Investidor', descricao: 'Participou de uma oferta de investimento',       icone: 'trending-up',       status: 'conquistado' },
  { id: '3', titulo: 'Pontual',    descricao: 'Pagou 3 parcelas consecutivas no prazo',          icone: 'check-circle',      status: 'bloqueado'   },
  { id: '4', titulo: 'Fidelidade', descricao: 'Conta ativa por 12 meses',                       icone: 'star',              status: 'bloqueado'   },
  { id: '5', titulo: 'Indicação',  descricao: 'Indicou um amigo que abriu conta',               icone: 'users',             status: 'bloqueado'   },
  { id: '6', titulo: 'Meta batida','descricao': 'Atingiu R$ 10.000 investidos',                  icone: 'target',            status: 'bloqueado'   },
];

const conquistados = SELOS.filter((s) => s.status === 'conquistado').length;

// ---------------------------------------------------------------------------
// Componente de opção de menu
// ---------------------------------------------------------------------------
function MenuRow({
  icon, label, sublabel, onPress, last = false,
}: {
  icon: string; label: string; sublabel?: string;
  onPress: () => void; last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[m.row, last && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={m.iconWrap}>
        <Feather name={icon as any} size={17} color={C.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={m.label}>{label}</Text>
        {sublabel ? <Text style={m.sublabel}>{sublabel}</Text> : null}
      </View>
      <Feather name="chevron-right" size={16} color={C.inkFaint} />
    </TouchableOpacity>
  );
}

const m = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: 15,
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  iconWrap: {
    width: 36, height: 36,
    borderRadius: radii.sm,
    backgroundColor: C.chipUrgent,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  label:    { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.ink },
  sublabel: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: C.inkSoft, marginTop: 1 },
});

// ---------------------------------------------------------------------------
// Tela principal
// ---------------------------------------------------------------------------
export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Perfil</Text>
        {/* Mais opções */}
        <TouchableOpacity
          style={s.maisBtn}
          onPress={() => router.push('/dados-pessoais' as any)}
          activeOpacity={0.75}
        >
          <Feather name="settings" size={17} color={C.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Avatar + nome */}
        <View style={s.hero}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{USUARIO.iniciais}</Text>
          </View>
          <Text style={s.nome}>{USUARIO.nome}</Text>
          <Text style={s.email}>{USUARIO.email}</Text>
          <View style={s.membroRow}>
            <Feather name="calendar" size={12} color={C.inkFaint} />
            <Text style={s.membroText}>Membro desde {USUARIO.membroDesde}</Text>
          </View>
        </View>

        {/* Selos */}
        <View style={s.section}>
          <View style={s.selosHeader}>
            <Text style={s.sectionLabel}>Selos</Text>
            <View style={s.selosBadge}>
              <Text style={s.selosBadgeText}>{conquistados} de {SELOS.length}</Text>
            </View>
          </View>

          <View style={s.selosGrid}>
            {SELOS.map((selo) => {
              const bloqueado = selo.status === 'bloqueado';
              return (
                <TouchableOpacity
                  key={selo.id}
                  style={[s.seloItem, bloqueado && s.seloItemBloqueado]}
                  activeOpacity={bloqueado ? 0.5 : 0.75}
                  disabled={bloqueado}
                >
                  <View style={[s.seloIconWrap, bloqueado && s.seloIconWrapBloqueado]}>
                    {bloqueado
                      ? <Feather name="lock" size={16} color={C.inkFaint} />
                      : <Feather name={selo.icone as any} size={16} color={C.ink} />
                    }
                  </View>
                  <Text style={[s.seloTitulo, bloqueado && s.seloTituloBloqueado]} numberOfLines={2}>
                    {selo.titulo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.selosRodape}>
            <Feather name="info" size={12} color={C.inkFaint} />
            <Text style={s.selosRodapeText}>
              Complete ações na plataforma para desbloquear selos
            </Text>
          </View>
        </View>

        {/* Menu de opções */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Conta</Text>
          <View style={s.menuCard}>
            <MenuRow
              icon="user"
              label="Dados pessoais"
              sublabel="Nome, e-mail, telefone, endereço"
              onPress={() => router.push('/dados-pessoais' as any)}
            />
            <MenuRow
              icon="credit-card"
              label="Minha conta"
              sublabel="Saldo, extrato e movimentações"
              onPress={() => router.push('/conta' as any)}
            />
            <MenuRow
              icon="bell"
              label="Notificações"
              onPress={() => router.push('/notificacoes' as any)}
              last
            />
          </View>
        </View>

        {/* Sair */}
        <TouchableOpacity style={s.sairBtn} activeOpacity={0.75}>
          <Feather name="log-out" size={16} color={C.red} />
          <Text style={s.sairText}>Sair da conta</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

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
  maisBtn: {
    width: 38, height: 38,
    borderRadius: radii.xl,
    backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 28,
    paddingHorizontal: spacing[5],
  },
  avatar: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: C.dark,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: fontSize['7xl'],
    color: '#fff',
  },
  nome: {
    fontFamily: fonts.display,
    fontSize: fontSize['4xl'],
    color: C.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  email: {
    fontSize: fontSize.md,
    fontFamily: fonts.regular,
    color: C.inkSoft,
    marginBottom: 10,
  },
  membroRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  membroText: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: C.inkFaint },

  // Seções
  section: { marginHorizontal: spacing[4], marginBottom: 20 },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: C.inkFaint,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  // Selos
  selosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  selosBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: C.dark,
  },
  selosBadgeText: { fontSize: fontSize.xs, fontFamily: fonts.semibold, color: '#fff' },

  selosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  seloItem: {
    width: '30.5%',
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    padding: spacing[3],
    alignItems: 'center',
    gap: 8,
  },
  seloItemBloqueado: { opacity: 0.45 },
  seloIconWrap: {
    width: 44, height: 44,
    borderRadius: radii.md,
    backgroundColor: C.chipUrgent,
    alignItems: 'center', justifyContent: 'center',
  },
  seloIconWrapBloqueado: { backgroundColor: C.chipUrgent },
  seloTitulo: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semibold,
    color: C.ink,
    textAlign: 'center',
    lineHeight: 15,
  },
  seloTituloBloqueado: { color: C.inkFaint },

  selosRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  selosRodapeText: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: C.inkFaint },

  // Menu card
  menuCard: {
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    overflow: 'hidden',
  },

  // Sair
  sairBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginHorizontal: spacing[4],
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 15,
    borderRadius: radii.xl,
    backgroundColor: C.redBg,
  },
  sairText: { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.red },
});
