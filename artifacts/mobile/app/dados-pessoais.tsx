import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  ScrollView, TextInput, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';

// ---------------------------------------------------------------------------
// Dados iniciais mock
// ---------------------------------------------------------------------------
const INICIAL = {
  nome:       'Rafael Mendes',
  email:      'rafael@notha.com.br',
  telefone:   '(11) 99988-7766',
  cpf:        '123.456.789-00',       // somente leitura
  nascimento: '12/04/1992',
  cep:        '01310-100',
  endereco:   'Av. Paulista',
  numero:     '1000',
  complemento:'Apto 42',
  bairro:     'Bela Vista',
  cidade:     'São Paulo',
  estado:     'SP',
};

// ---------------------------------------------------------------------------
// Campo de formulário
// ---------------------------------------------------------------------------
function Campo({
  label, value, onChange, placeholder, mask, readOnly = false,
  keyboardType = 'default', autoCapitalize = 'words',
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  mask?: string;
  readOnly?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  const [focado, setFocado] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}{readOnly && <Text style={f.readOnlyTag}> · somente leitura</Text>}</Text>
      <View style={[f.inputWrap, focado && f.inputWrapFocado, readOnly && f.inputWrapReadOnly]}>
        <TextInput
          style={[f.input, readOnly && f.inputReadOnly]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? label}
          placeholderTextColor={C.inkFaint}
          editable={!readOnly}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          selectionColor={C.ink}
        />
        {readOnly && <Feather name="lock" size={13} color={C.inkFaint} />}
      </View>
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: fontSize.sm, fontFamily: fonts.semibold, color: C.ink, marginBottom: 7 },
  readOnlyTag: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: C.inkFaint },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    paddingHorizontal: spacing[4],
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: spacing[2],
  },
  inputWrapFocado: { borderColor: C.ink },
  inputWrapReadOnly: { backgroundColor: C.chipMuted },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fonts.regular,
    color: C.ink,
  },
  inputReadOnly: { color: C.inkSoft },
});

// ---------------------------------------------------------------------------
// Tela principal
// ---------------------------------------------------------------------------
export default function DadosPessoaisScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const [dados, setDados] = useState(INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo]     = useState(false);

  const set = (key: keyof typeof INICIAL) => (val: string) =>
    setDados((d) => ({ ...d, [key]: val }));

  const handleSalvar = () => {
    setSalvando(true);
    setSalvo(false);
    setTimeout(() => {
      setSalvando(false);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    }, 1400);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[s.screen, { paddingTop: topPad }]}>
        {/* Header */}
        <View style={s.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={s.title}>Dados pessoais</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        >

          {/* Seção: identificação */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Identificação</Text>
            <Campo label="Nome completo"      value={dados.nome}       onChange={set('nome')} />
            <Campo label="CPF"                value={dados.cpf}        readOnly />
            <Campo label="Data de nascimento" value={dados.nascimento}  onChange={set('nascimento')}
              placeholder="DD/MM/AAAA" keyboardType="numeric" autoCapitalize="none" />
          </View>

          {/* Seção: contato */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Contato</Text>
            <Campo label="E-mail"   value={dados.email}    onChange={set('email')}
              keyboardType="email-address" autoCapitalize="none" />
            <Campo label="Telefone" value={dados.telefone} onChange={set('telefone')}
              keyboardType="phone-pad" autoCapitalize="none" />
          </View>

          {/* Seção: endereço */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Endereço</Text>
            <Campo label="CEP" value={dados.cep} onChange={set('cep')}
              keyboardType="numeric" autoCapitalize="none" />
            <Campo label="Logradouro" value={dados.endereco}    onChange={set('endereco')} />
            <View style={s.row2}>
              <View style={{ flex: 1 }}>
                <Campo label="Número"      value={dados.numero}    onChange={set('numero')}     keyboardType="numeric" autoCapitalize="none" />
              </View>
              <View style={{ flex: 1.8 }}>
                <Campo label="Complemento" value={dados.complemento} onChange={set('complemento')} />
              </View>
            </View>
            <Campo label="Bairro" value={dados.bairro} onChange={set('bairro')} />
            <View style={s.row2}>
              <View style={{ flex: 2.5 }}>
                <Campo label="Cidade" value={dados.cidade} onChange={set('cidade')} />
              </View>
              <View style={{ flex: 1 }}>
                <Campo label="Estado" value={dados.estado} onChange={set('estado')}
                  autoCapitalize="characters" />
              </View>
            </View>
          </View>

        </ScrollView>

        {/* CTA fixo */}
        <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          {salvo && (
            <View style={s.salvoRow}>
              <Feather name="check-circle" size={14} color={C.ink} />
              <Text style={s.salvoText}>Dados atualizados com sucesso</Text>
            </View>
          )}
          <TouchableOpacity
            style={[s.ctaBtn, salvando && s.ctaBtnLoading]}
            onPress={handleSalvar}
            disabled={salvando}
            activeOpacity={0.85}
          >
            {salvando
              ? <Text style={s.ctaText}>Salvando…</Text>
              : <>
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={s.ctaText}>Salvar alterações</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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

  section: {
    marginHorizontal: spacing[4],
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontFamily: fonts.bold,
    color: C.inkFaint,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 14,
    marginTop: 14,
    paddingHorizontal: 4,
  },

  row2: {
    flexDirection: 'row',
    gap: 10,
  },

  ctaBar: {
    paddingHorizontal: spacing[4],
    paddingTop: 12,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.line,
    gap: 10,
  },
  ctaBtn: {
    flexDirection: 'row',
    backgroundColor: C.dark,
    borderRadius: radii.xl,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaBtnLoading: { backgroundColor: C.inkSoft },
  ctaText: { fontFamily: fonts.bold, fontSize: fontSize['lg+'], color: '#fff', letterSpacing: 0.1 },

  salvoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  salvoText: { fontSize: fontSize.sm, fontFamily: fonts.semibold, color: C.ink },
});
