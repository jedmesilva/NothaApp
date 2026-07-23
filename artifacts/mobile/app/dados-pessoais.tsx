import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';

// Mock — trocar por dados reais do contexto/API
const INITIAL = {
  nome:        'Rafael Mendes',
  email:       'rafael@email.com',
  telefone:    '(11) 99999-0000',
  cep:         '01310-100',
  logradouro:  'Av. Paulista',
  numero:      '1000',
  complemento: 'Apto 42',
  bairro:      'Bela Vista',
  cidade:      'São Paulo',
  estado:      'SP',
};

type FormData = typeof INITIAL;
type Field = keyof FormData;

const FIELDS: { key: Field; label: string; placeholder: string; keyboard?: any; autoCapitalize?: any }[] = [
  { key: 'nome',        label: 'Nome completo',  placeholder: 'Seu nome completo',  autoCapitalize: 'words' },
  { key: 'email',       label: 'E-mail',         placeholder: 'seu@email.com',      keyboard: 'email-address', autoCapitalize: 'none' },
  { key: 'telefone',    label: 'Telefone',        placeholder: '(11) 99999-0000',   keyboard: 'phone-pad' },
];

const ADDRESS_FIELDS: { key: Field; label: string; placeholder: string; keyboard?: any; flex?: number }[] = [
  { key: 'cep',         label: 'CEP',            placeholder: '00000-000',          keyboard: 'numeric', flex: 1 },
  { key: 'logradouro',  label: 'Logradouro',     placeholder: 'Rua, Av...' },
  { key: 'numero',      label: 'Número',         placeholder: '0',                  keyboard: 'numeric', flex: 1 },
  { key: 'complemento', label: 'Complemento',    placeholder: 'Apto, Bloco...',     flex: 2 },
  { key: 'bairro',      label: 'Bairro',         placeholder: 'Bairro' },
  { key: 'cidade',      label: 'Cidade',         placeholder: 'Cidade',             flex: 2 },
  { key: 'estado',      label: 'Estado (UF)',     placeholder: 'SP',                 flex: 1 },
];

export default function DadosPessoaisScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;
  const [form, setForm] = useState<FormData>(INITIAL);
  const [saved, setSaved] = useState(false);

  const update = (key: Field) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: chamar API para persistir
    setSaved(true);
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
          <Text style={s.title}>Dados Pessoais</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Informações pessoais ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Informações pessoais</Text>
            <View style={s.fieldCard}>
              {FIELDS.map((f, idx) => (
                <View
                  key={f.key}
                  style={[
                    s.fieldRow,
                    idx < FIELDS.length - 1 && s.fieldRowBorder,
                  ]}
                >
                  <Text style={s.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={form[f.key]}
                    onChangeText={update(f.key)}
                    placeholder={f.placeholder}
                    placeholderTextColor={C.inkFaint}
                    keyboardType={f.keyboard ?? 'default'}
                    autoCapitalize={f.autoCapitalize ?? 'sentences'}
                    returnKeyType="next"
                  />
                </View>
              ))}
            </View>
          </View>

          {/* ── Endereço ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Endereço</Text>
            <View style={s.fieldCard}>
              {/* CEP sozinho */}
              <View style={[s.fieldRow, s.fieldRowBorder]}>
                <Text style={s.fieldLabel}>CEP</Text>
                <TextInput
                  style={s.fieldInput}
                  value={form.cep}
                  onChangeText={update('cep')}
                  placeholder="00000-000"
                  placeholderTextColor={C.inkFaint}
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>

              {/* Logradouro */}
              <View style={[s.fieldRow, s.fieldRowBorder]}>
                <Text style={s.fieldLabel}>Logradouro</Text>
                <TextInput
                  style={s.fieldInput}
                  value={form.logradouro}
                  onChangeText={update('logradouro')}
                  placeholder="Rua, Av..."
                  placeholderTextColor={C.inkFaint}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {/* Número + Complemento na mesma linha */}
              <View style={[s.inlineRow, s.fieldRowBorder]}>
                <View style={[s.inlineField, { flex: 1 }]}>
                  <Text style={s.fieldLabel}>Número</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={form.numero}
                    onChangeText={update('numero')}
                    placeholder="0"
                    placeholderTextColor={C.inkFaint}
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                </View>
                <View style={s.inlineDivider} />
                <View style={[s.inlineField, { flex: 2 }]}>
                  <Text style={s.fieldLabel}>Complemento</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={form.complemento}
                    onChangeText={update('complemento')}
                    placeholder="Apto, Bloco..."
                    placeholderTextColor={C.inkFaint}
                    autoCapitalize="sentences"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Bairro */}
              <View style={[s.fieldRow, s.fieldRowBorder]}>
                <Text style={s.fieldLabel}>Bairro</Text>
                <TextInput
                  style={s.fieldInput}
                  value={form.bairro}
                  onChangeText={update('bairro')}
                  placeholder="Bairro"
                  placeholderTextColor={C.inkFaint}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {/* Cidade + Estado na mesma linha */}
              <View style={s.inlineRow}>
                <View style={[s.inlineField, { flex: 3 }]}>
                  <Text style={s.fieldLabel}>Cidade</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={form.cidade}
                    onChangeText={update('cidade')}
                    placeholder="Cidade"
                    placeholderTextColor={C.inkFaint}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                <View style={s.inlineDivider} />
                <View style={[s.inlineField, { flex: 1 }]}>
                  <Text style={s.fieldLabel}>UF</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={form.estado}
                    onChangeText={update('estado')}
                    placeholder="SP"
                    placeholderTextColor={C.inkFaint}
                    autoCapitalize="characters"
                    maxLength={2}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* ── Botão salvar ── */}
          <View style={s.saveWrap}>
            <TouchableOpacity
              style={[s.saveBtn, saved && s.saveBtnSuccess]}
              activeOpacity={0.82}
              onPress={handleSave}
            >
              <Text style={s.saveBtnText}>
                {saved ? 'Salvo ✓' : 'Salvar alterações'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    marginTop: spacing[5],
    marginHorizontal: spacing[4],
  },
  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: fontSize['sm+'],
    color: C.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing[3],
    marginLeft: 4,
  },

  fieldCard: {
    backgroundColor: C.card,
    borderRadius: radii.cardLg,
    overflow: 'hidden',
  },
  fieldRow: {
    paddingHorizontal: spacing[5],
    paddingVertical: 14,
  },
  fieldRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: C.inkFaint,
    marginBottom: 4,
  },
  fieldInput: {
    fontFamily: fonts.semibold,
    fontSize: fontSize['base+'],
    color: C.ink,
    padding: 0,
  },

  // Linha com dois campos lado a lado
  inlineRow: {
    flexDirection: 'row',
  },
  inlineField: {
    paddingHorizontal: spacing[5],
    paddingVertical: 14,
  },
  inlineDivider: {
    width: 1,
    backgroundColor: C.line,
  },

  // Botão salvar
  saveWrap: {
    marginHorizontal: spacing[4],
    marginTop: spacing[6],
  },
  saveBtn: {
    backgroundColor: C.dark,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnSuccess: {
    backgroundColor: '#2D7A4F',
  },
  saveBtnText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize['base+'],
    color: '#fff',
    letterSpacing: 0.1,
  },
});
