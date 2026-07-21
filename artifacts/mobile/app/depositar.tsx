import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView, Clipboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';

// Dados fixos da conta (em produção: API)
const CHAVE_PIX     = 'notha@financeiro.com.br';
const NOME_FAVORECIDO = 'Notha Financeira S.A.';
const CNPJ_FAVORECIDO = '12.345.678/0001-90';
const BANCO_FAVORECIDO = 'Banco Notha — 999';

// Componente de QR code visual (grid monocromático)
// Em produção: react-native-qrcode-svg com o payload Pix real
function QRCodePlaceholder() {
  // Padrão de blocos que simula a aparência de um QR code
  const grid = [
    [1,1,1,1,1,1,1, 0, 1,0,1,1,0, 0, 1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1, 0, 0,1,0,0,1, 0, 1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1, 0, 1,0,1,0,0, 0, 1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1, 0, 0,0,1,1,0, 0, 1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1, 0, 1,1,0,0,1, 0, 1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1, 0, 0,1,0,1,0, 0, 1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1, 0, 1,0,1,0,1, 0, 1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0, 0, 0,1,0,0,0, 0, 0,0,0,0,0,0,0],
    [1,1,0,1,0,1,1, 1, 0,0,1,0,1, 1, 0,1,1,0,1,0,1],
    [0,0,1,0,1,0,0, 0, 1,0,0,1,0, 0, 1,0,0,1,0,1,0],
    [1,0,1,1,0,1,0, 1, 0,1,0,0,1, 1, 0,1,0,1,1,0,1],
    [0,1,0,0,1,0,1, 0, 1,0,1,0,0, 0, 1,0,1,0,0,1,0],
    [1,0,1,0,1,1,0, 1, 0,0,1,1,0, 1, 0,1,0,1,0,1,1],
    [0,0,0,0,0,0,0, 0, 1,0,0,0,1, 0, 0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1, 0, 0,1,0,1,0, 0, 1,0,0,1,0,0,1],
    [1,0,0,0,0,0,1, 0, 1,0,1,0,1, 0, 0,1,0,0,1,0,0],
    [1,0,1,1,1,0,1, 0, 0,1,0,0,0, 1, 1,0,1,0,1,1,0],
    [1,0,1,1,1,0,1, 0, 1,0,0,1,0, 0, 0,1,0,1,0,0,1],
    [1,0,1,1,1,0,1, 1, 0,1,0,0,1, 1, 1,0,0,1,1,0,1],
    [1,0,0,0,0,0,1, 0, 1,0,1,0,0, 0, 0,1,1,0,0,1,0],
    [1,1,1,1,1,1,1, 0, 0,0,0,1,0, 1, 1,0,1,0,1,0,1],
  ];
  const CELL = 13;
  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 16 }}>
      {grid.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={{
                width: CELL,
                height: CELL,
                backgroundColor: cell === 1 ? '#15151D' : '#fff',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function DepositarScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const [copiado, setCopiado] = useState(false);

  const copiarChave = () => {
    Clipboard.setString(CHAVE_PIX);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={s.title}>Depositar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Instrução */}
        <View style={s.instrucaoCard}>
          <View style={s.instrucaoIcon}>
            <Feather name="arrow-down-circle" size={20} color={C.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.instrucaoTitulo}>Como depositar</Text>
            <Text style={s.instrucaoTexto}>
              Escaneie o QR code ou copie a chave Pix abaixo no seu banco. O saldo aparece em até 5 minutos.
            </Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={s.qrCard}>
          <Text style={s.qrLabel}>ESCANEIE COM SEU BANCO</Text>
          <View style={s.qrWrap}>
            <QRCodePlaceholder />
          </View>
          <Text style={s.qrNote}>Qualquer valor • Crédito imediato</Text>
        </View>

        {/* Divisor */}
        <View style={s.divisorRow}>
          <View style={s.divisorLine} />
          <Text style={s.divisorText}>ou use a chave Pix</Text>
          <View style={s.divisorLine} />
        </View>

        {/* Chave Pix copiável */}
        <TouchableOpacity style={s.chaveCard} onPress={copiarChave} activeOpacity={0.8}>
          <View style={s.chaveIconWrap}>
            <Feather name="mail" size={18} color={C.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.chaveTipo}>E-mail</Text>
            <Text style={s.chaveValor}>{CHAVE_PIX}</Text>
          </View>
          <View style={[s.copiarBtn, copiado && s.copiarBtnActive]}>
            <Feather name={copiado ? 'check' : 'copy'} size={15} color={copiado ? '#fff' : C.ink} />
            <Text style={[s.copiarText, copiado && s.copiarTextActive]}>
              {copiado ? 'Copiado!' : 'Copiar'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Dados do favorecido */}
        <View style={s.favorecidoCard}>
          <Text style={s.favorecidoTitulo}>Dados do favorecido</Text>
          <FavorecidoRow label="Nome" value={NOME_FAVORECIDO} />
          <FavorecidoRow label="CNPJ" value={CNPJ_FAVORECIDO} />
          <FavorecidoRow label="Banco" value={BANCO_FAVORECIDO} last />
        </View>
      </ScrollView>
    </View>
  );
}

function FavorecidoRow({
  label, value, last = false,
}: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[fr.row, last && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
      <Text style={fr.label}>{label}</Text>
      <Text style={fr.value}>{value}</Text>
    </View>
  );
}

const fr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    gap: spacing[4],
  },
  label: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: C.inkSoft },
  value: { fontSize: fontSize.sm, fontFamily: fonts.semibold, color: C.ink, textAlign: 'right', flex: 1 },
});

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  title: { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },

  instrucaoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: 18,
    marginBottom: 6,
    padding: spacing[4],
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
  },
  instrucaoIcon: {
    width: 40, height: 40,
    borderRadius: radii.sm,
    backgroundColor: C.chipUrgent,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  instrucaoTitulo: { fontFamily: fonts.bold, fontSize: fontSize['base+'], color: C.ink, marginBottom: 3 },
  instrucaoTexto:  { fontFamily: fonts.regular, fontSize: fontSize.sm, color: C.inkSoft, lineHeight: 18 },

  qrCard: {
    marginHorizontal: spacing[4],
    marginTop: 14,
    padding: spacing[5],
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: fontSize['2xs'],
    fontFamily: fonts.bold,
    color: C.inkFaint,
    letterSpacing: 0.8,
    marginBottom: spacing[4],
  },
  qrWrap: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderRadius: 16,
  },
  qrNote: {
    marginTop: spacing[4],
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: C.inkFaint,
  },

  divisorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing[4],
    marginVertical: 18,
    gap: spacing[3],
  },
  divisorLine: { flex: 1, height: 1, backgroundColor: C.line },
  divisorText: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: C.inkFaint },

  chaveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    padding: spacing[4],
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    borderWidth: 1.5,
    borderColor: C.line,
  },
  chaveIconWrap: {
    width: 40, height: 40,
    borderRadius: radii.sm,
    backgroundColor: C.chipUrgent,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  chaveTipo:  { fontSize: fontSize.xs, fontFamily: fonts.semibold, color: C.inkFaint, marginBottom: 2 },
  chaveValor: { fontSize: fontSize['base+'], fontFamily: fonts.semibold, color: C.ink },
  copiarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: C.chipUrgent,
    flexShrink: 0,
  },
  copiarBtnActive: { backgroundColor: C.dark },
  copiarText: { fontSize: fontSize.sm, fontFamily: fonts.semibold, color: C.ink },
  copiarTextActive: { color: '#fff' },

  favorecidoCard: {
    marginHorizontal: spacing[4],
    marginTop: 14,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
  },
  favorecidoTitulo: {
    fontFamily: fonts.bold,
    fontSize: fontSize['base+'],
    color: C.ink,
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    marginBottom: 4,
  },
});
