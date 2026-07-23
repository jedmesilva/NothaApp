import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';

// Mock user — trocar por contexto de autenticação quando disponível
const USER = {
  nome: 'Rafael Mendes',
  email: 'rafael@email.com',
  iniciais: 'R',
};

// Selos que o usuário conquistou (placeholder até a UI de selos ser definida)
const SELOS_CONQUISTADOS: { id: string; label: string; icone: string }[] = [
  { id: 'primeiro-emprestimo', label: 'Primeiro Empréstimo', icone: '🏅' },
  { id: 'pagamento-em-dia',    label: 'Pagador Pontual',     icone: '⭐' },
];

// Selos bloqueados (exemplo de progressão)
const SELOS_BLOQUEADOS: { id: string; label: string; icone: string }[] = [
  { id: 'cinco-emprestimos',  label: '5 Empréstimos',   icone: '🔒' },
  { id: 'investidor',         label: 'Primeiro Investimento', icone: '🔒' },
  { id: 'indicacao',          label: 'Trouxe Amigos',   icone: '🔒' },
];

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Perfil</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Card do usuário (clicável → dados pessoais) ── */}
        <TouchableOpacity
          style={s.userCard}
          activeOpacity={0.82}
          onPress={() => router.push('/dados-pessoais' as any)}
        >
          {/* Avatar grande */}
          <View style={s.avatar}>
            <Text style={s.avatarText}>{USER.iniciais}</Text>
          </View>

          {/* Nome e e-mail */}
          <View style={s.userInfo}>
            <Text style={s.userName}>{USER.nome}</Text>
            <Text style={s.userEmail}>{USER.email}</Text>
          </View>

          {/* Indicação de que é clicável */}
          <View style={s.editHint}>
            <Text style={s.editHintText}>Editar dados</Text>
            <Feather name="chevron-right" size={14} color={C.inkSoft} />
          </View>
        </TouchableOpacity>

        {/* ── Seção de selos ── */}
        <Text style={s.sectionLabel}>Selos</Text>

        <View style={s.selosCard}>
          {/* Conquistados */}
          {SELOS_CONQUISTADOS.length > 0 && (
            <>
              <Text style={s.selosSubtitle}>Conquistados</Text>
              <View style={s.selosGrid}>
                {SELOS_CONQUISTADOS.map((selo) => (
                  <View key={selo.id} style={s.seloItem}>
                    <View style={s.seloIconWrap}>
                      <Text style={s.seloEmoji}>{selo.icone}</Text>
                    </View>
                    <Text style={s.seloLabel}>{selo.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Divisor */}
          {SELOS_CONQUISTADOS.length > 0 && SELOS_BLOQUEADOS.length > 0 && (
            <View style={s.divider} />
          )}

          {/* Bloqueados */}
          {SELOS_BLOQUEADOS.length > 0 && (
            <>
              <Text style={s.selosSubtitle}>Em breve</Text>
              <View style={s.selosGrid}>
                {SELOS_BLOQUEADOS.map((selo) => (
                  <View key={selo.id} style={[s.seloItem, s.seloItemBloqueado]}>
                    <View style={[s.seloIconWrap, s.seloIconWrapBloqueado]}>
                      <Feather name="lock" size={18} color={C.inkFaint} />
                    </View>
                    <Text style={[s.seloLabel, s.seloLabelBloqueado]}>{selo.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
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
    fontFamily: fonts.display,
    fontSize: fontSize['3xl'],
    color: C.ink,
    letterSpacing: -0.2,
  },

  // ── Card do usuário ──
  userCard: {
    marginHorizontal: spacing[4],
    marginBottom: 8,
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    padding: spacing[5],
    gap: spacing[4],
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  avatarText: {
    color: '#fff',
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
  },
  userInfo: {
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontFamily: fonts.display,
    fontSize: fontSize['2xl'],
    color: C.ink,
    letterSpacing: -0.2,
  },
  userEmail: {
    fontFamily: fonts.regular,
    fontSize: fontSize['sm+'],
    color: C.inkFaint,
  },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  editHintText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize['sm+'],
    color: C.inkSoft,
  },

  // ── Selos ──
  sectionLabel: {
    fontFamily: fonts.display,
    fontSize: fontSize['lg'],
    color: C.ink,
    marginHorizontal: spacing[5],
    marginTop: spacing[5],
    marginBottom: spacing[3],
    letterSpacing: -0.1,
  },
  selosCard: {
    marginHorizontal: spacing[4],
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    padding: spacing[5],
  },
  selosSubtitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize['sm+'],
    color: C.inkFaint,
    marginBottom: spacing[4],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  selosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  seloItem: {
    width: 80,
    alignItems: 'center',
    gap: 8,
  },
  seloItemBloqueado: {
    opacity: 0.5,
  },
  seloIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.xl,
    backgroundColor: C.chipUrgent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seloIconWrapBloqueado: {
    backgroundColor: C.chipMuted,
  },
  seloEmoji: {
    fontSize: 26,
  },
  seloLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: C.ink,
    textAlign: 'center',
    lineHeight: 15,
  },
  seloLabelBloqueado: {
    color: C.inkFaint,
  },
  divider: {
    height: 1,
    backgroundColor: C.line,
    marginVertical: spacing[4],
  },
});
