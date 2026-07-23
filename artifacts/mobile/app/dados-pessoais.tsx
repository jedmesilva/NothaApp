import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';
import { BackButton } from '@/components/ds';
import { useProfile, useUpdateProfile, type UpdateProfileInput } from '@/hooks/useProfile';

type FormData = {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const EMPTY: FormData = {
  nome: '', email: '', telefone: '', cpf: '', dataNascimento: '',
  cep: '', logradouro: '', numero: '', complemento: '',
  bairro: '', cidade: '', estado: '',
};

type Field = keyof FormData;

const PERSONAL_FIELDS: { key: Field; label: string; placeholder: string; keyboard?: any; autoCapitalize?: any; editable?: boolean }[] = [
  { key: 'nome',           label: 'Nome completo',    placeholder: 'Seu nome completo',  autoCapitalize: 'words' },
  { key: 'email',          label: 'E-mail',           placeholder: 'seu@email.com',      keyboard: 'email-address', autoCapitalize: 'none', editable: false },
  { key: 'telefone',       label: 'Telefone',         placeholder: '(11) 99999-0000',    keyboard: 'phone-pad' },
  { key: 'cpf',            label: 'CPF',              placeholder: '000.000.000-00',     keyboard: 'numeric' },
  { key: 'dataNascimento', label: 'Data de nascimento', placeholder: 'DD/MM/AAAA',       keyboard: 'numeric' },
];

const ADDRESS_FIELDS: { key: Field; label: string; placeholder: string; keyboard?: any; flex?: number }[] = [
  { key: 'cep',        label: 'CEP',          placeholder: '00000-000', keyboard: 'numeric', flex: 1 },
  { key: 'logradouro', label: 'Logradouro',   placeholder: 'Rua, Av...' },
  { key: 'numero',     label: 'Número',       placeholder: '0',         keyboard: 'numeric', flex: 1 },
  { key: 'complemento',label: 'Complemento',  placeholder: 'Apto, Bloco...',               flex: 2 },
  { key: 'bairro',     label: 'Bairro',       placeholder: 'Bairro' },
  { key: 'cidade',     label: 'Cidade',       placeholder: 'Cidade',                        flex: 2 },
  { key: 'estado',     label: 'Estado (UF)',  placeholder: 'SP',                            flex: 1 },
];

export default function DadosPessoaisScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 20 : insets.top;

  const { data, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState<FormData>(EMPTY);
  const [saved, setSaved] = useState(false);

  // Popula o formulário quando os dados chegam da API
  useEffect(() => {
    if (!data) return;
    const p = data.profile;
    setForm({
      nome:           data.user.name ?? '',
      email:          data.user.email ?? '',
      telefone:       p?.phone ?? '',
      cpf:            p?.cpf ?? '',
      dataNascimento: p?.birthDate ?? '',
      cep:            p?.zipCode ?? '',
      logradouro:     p?.street ?? '',
      numero:         p?.streetNumber ?? '',
      complemento:    p?.complement ?? '',
      bairro:         p?.neighborhood ?? '',
      cidade:         p?.city ?? '',
      estado:         p?.state ?? '',
    });
  }, [data]);

  const update = (key: Field) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    const payload: UpdateProfileInput = {
      name:         form.nome        || undefined,
      phone:        form.telefone    || undefined,
      cpf:          form.cpf         || undefined,
      birthDate:    form.dataNascimento || undefined,
      zipCode:      form.cep         || undefined,
      street:       form.logradouro  || undefined,
      streetNumber: form.numero      || undefined,
      complement:   form.complemento || undefined,
      neighborhood: form.bairro      || undefined,
      city:         form.cidade      || undefined,
      state:        form.estado      || undefined,
    };
    try {
      await updateProfile.mutateAsync(payload);
      setSaved(true);
    } catch {
      // erro exibido via estado de erro da mutation
    }
  };

  if (isLoading) {
    return (
      <View style={[s.screen, { paddingTop: topPad, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={C.ink} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.screen, { paddingTop: topPad }]}>
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
              {PERSONAL_FIELDS.map((f, idx) => (
                <View
                  key={f.key}
                  style={[s.fieldRow, idx < PERSONAL_FIELDS.length - 1 && s.fieldRowBorder]}
                >
                  <Text style={s.fieldLabel}>{f.label}</Text>
                  <TextInput
                    style={[s.fieldInput, f.editable === false && s.fieldInputReadOnly]}
                    value={form[f.key]}
                    onChangeText={f.editable === false ? undefined : update(f.key)}
                    placeholder={f.placeholder}
                    placeholderTextColor={C.inkFaint}
                    keyboardType={f.keyboard ?? 'default'}
                    autoCapitalize={f.autoCapitalize ?? 'sentences'}
                    editable={f.editable !== false}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* ── Endereço ── */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Endereço</Text>
            <View style={s.fieldCard}>
              {ADDRESS_FIELDS.map((f, idx) => {
                const isInline = f.key === 'numero' || f.key === 'complemento'
                  || f.key === 'cidade' || f.key === 'estado';
                const prevKey = ADDRESS_FIELDS[idx - 1]?.key;
                const isSecondOfPair =
                  (f.key === 'complemento' && prevKey === 'numero') ||
                  (f.key === 'estado' && prevKey === 'cidade');

                if (isSecondOfPair) return null; // renderizado junto com o anterior
                if (!isInline) {
                  return (
                    <View key={f.key} style={[s.fieldRow, idx < ADDRESS_FIELDS.length - 1 && s.fieldRowBorder]}>
                      <Text style={s.fieldLabel}>{f.label}</Text>
                      <TextInput
                        style={s.fieldInput}
                        value={form[f.key]}
                        onChangeText={update(f.key)}
                        placeholder={f.placeholder}
                        placeholderTextColor={C.inkFaint}
                        keyboardType={f.keyboard ?? 'default'}
                      />
                    </View>
                  );
                }

                // Par inline
                const next = ADDRESS_FIELDS[idx + 1];
                return (
                  <View key={f.key} style={[s.inlineRow, idx < ADDRESS_FIELDS.length - 1 && s.fieldRowBorder]}>
                    <View style={[s.inlineField, { flex: f.flex ?? 1 }]}>
                      <Text style={s.fieldLabel}>{f.label}</Text>
                      <TextInput
                        style={s.fieldInput}
                        value={form[f.key]}
                        onChangeText={update(f.key)}
                        placeholder={f.placeholder}
                        placeholderTextColor={C.inkFaint}
                        keyboardType={f.keyboard ?? 'default'}
                      />
                    </View>
                    {next && (
                      <>
                        <View style={s.inlineDivider} />
                        <View style={[s.inlineField, { flex: next.flex ?? 1 }]}>
                          <Text style={s.fieldLabel}>{next.label}</Text>
                          <TextInput
                            style={s.fieldInput}
                            value={form[next.key]}
                            onChangeText={update(next.key)}
                            placeholder={next.placeholder}
                            placeholderTextColor={C.inkFaint}
                            keyboardType={next.keyboard ?? 'default'}
                          />
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Erro ── */}
          {updateProfile.isError && (
            <Text style={s.errorText}>
              {(updateProfile.error as Error)?.message ?? 'Erro ao salvar. Tente novamente.'}
            </Text>
          )}

          {/* ── Salvar ── */}
          <View style={s.saveWrap}>
            <TouchableOpacity
              style={[s.saveBtn, saved && s.saveBtnSuccess]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.saveBtnText}>{saved ? 'Salvo ✓' : 'Salvar alterações'}</Text>
              }
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
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[5], paddingBottom: spacing[3],
  },
  title: { fontFamily: fonts.display, fontSize: fontSize['3xl'], color: C.ink, letterSpacing: -0.2 },

  section:      { marginHorizontal: spacing[4], marginBottom: spacing[4] },
  sectionLabel: {
    fontFamily: fonts.display, fontSize: fontSize.lg, color: C.ink,
    marginBottom: spacing[3], letterSpacing: -0.1,
  },
  fieldCard:    { backgroundColor: C.card, borderRadius: radii.cardLg, overflow: 'hidden' },
  fieldRow:     { paddingHorizontal: spacing[5], paddingVertical: 14 },
  fieldRowBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  fieldLabel:   { fontFamily: fonts.medium, fontSize: fontSize.sm, color: C.inkFaint, marginBottom: 4 },
  fieldInput:   { fontFamily: fonts.semibold, fontSize: fontSize['base+'], color: C.ink, padding: 0 },
  fieldInputReadOnly: { color: C.inkSoft },

  inlineRow:    { flexDirection: 'row' },
  inlineField:  { paddingHorizontal: spacing[5], paddingVertical: 14 },
  inlineDivider:{ width: 1, backgroundColor: C.line },

  errorText: {
    marginHorizontal: spacing[5], marginBottom: spacing[3],
    fontFamily: fonts.regular, fontSize: fontSize['sm+'], color: C.red,
  },

  saveWrap: { marginHorizontal: spacing[4], marginTop: spacing[2] },
  saveBtn:  { backgroundColor: C.dark, borderRadius: radii.lg, paddingVertical: 16, alignItems: 'center' },
  saveBtnSuccess: { backgroundColor: '#2D7A4F' },
  saveBtnText: { fontFamily: fonts.semibold, fontSize: fontSize['base+'], color: '#fff', letterSpacing: 0.1 },
});
