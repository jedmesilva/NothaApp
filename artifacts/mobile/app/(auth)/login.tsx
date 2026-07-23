import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { palette as C, fonts, fontSize, radii, spacing } from '@/constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // AuthContext atualiza o user → _layout redireciona para (tabs)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.screen}
        contentContainerStyle={[
          s.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Marca */}
        <View style={s.brand}>
          <Text style={s.brandName}>notha</Text>
          <Text style={s.brandSub}>Bem-vindo de volta</Text>
        </View>

        {/* Formulário */}
        <View style={s.card}>
          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={s.input}
            placeholder="seu@email.com"
            placeholderTextColor={C.inkFaint}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Text style={[s.label, { marginTop: spacing[4] }]}>Senha</Text>
          <TextInput
            style={s.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={C.inkFaint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Entrar</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <View style={s.footer}>
          <Text style={s.footerText}>Ainda não tem conta?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/register')} activeOpacity={0.7}>
            <Text style={s.footerLink}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: spacing[5], flexGrow: 1 },

  brand:     { marginBottom: spacing[8] },
  brandName: { fontFamily: fonts.display, fontSize: 36, color: C.ink, letterSpacing: -1, marginBottom: 6 },
  brandSub:  { fontFamily: fonts.regular, fontSize: fontSize.md, color: C.inkSoft },

  card:  { backgroundColor: C.card, borderRadius: radii.cardLg, padding: spacing[5] },
  label: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: C.inkFaint, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },

  input: {
    backgroundColor: C.bg,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: 14,
    fontSize: fontSize.base,
    fontFamily: fonts.regular,
    color: C.ink,
  },

  errorText: {
    marginTop: spacing[3],
    fontFamily: fonts.regular,
    fontSize: fontSize['sm+'],
    color: C.red,
  },

  btn:         { marginTop: spacing[5], backgroundColor: C.dark, borderRadius: radii.lg, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText:     { fontFamily: fonts.bold, fontSize: fontSize['base+'], color: '#fff' },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: spacing[6] },
  footerText: { fontFamily: fonts.regular, fontSize: fontSize['sm+'], color: C.inkSoft },
  footerLink: { fontFamily: fonts.bold, fontSize: fontSize['sm+'], color: C.ink },
});
