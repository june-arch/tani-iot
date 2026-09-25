import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppInput, pesanField } from '@/src/components/ui';
import { ErrorState } from '@/src/components/ui/AppState';
import { normalizeError } from '@/src/api/client';
import { loginSchema, type LoginForm } from '@/src/models/auth';
import { authService } from '@/src/services/authService';
import { useAuthStore } from '@/src/stores/auth';
import { INK, PARCHMENT, STONE, WINE } from '@/src/theme';

export default function LoginScreen() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [pesan, setPesan] = useState<string | null>(null);

  const masuk = useMutation({
    mutationFn: (v: LoginForm) => authService.masuk(v.email, v.password),
    onSuccess: async (hasil) => {
      await setAuth(hasil.accessToken, {
        id: hasil.user.id,
        email: hasil.user.email,
        name: hasil.user.nama,
      });
      router.replace('/(tabs)/kebun');
    },
    onError: (e: unknown) => setPesan(normalizeError(e)),
  });

  const form = useForm({
    defaultValues: { email: '', password: '' } as LoginForm,
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      setPesan(null);
      await masuk.mutateAsync(value);
    },
  });

  return (
    <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
      <View style={st.kartu}>
        <View style={st.logo}>
          <Text style={st.logoTeks}>🌱</Text>
        </View>
        <Text style={st.judul}>Masuk ke Tani IoT</Text>
        <Text style={st.sub}>Kelola kebun, lahan, dan sensor Anda</Text>
        <form.Field name="email">
          {(field) => (
            <AppInput
              label="Email"
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={pesanField(field)}
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <AppInput
              label="Kata sandi"
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              error={pesanField(field)}
            />
          )}
        </form.Field>
        {pesan ? (
          <ErrorState pesan={ramah(pesan)} onRetry={() => setPesan(null)} />
        ) : null}
        <AppButton
          judul="Masuk"
          loading={masuk.isPending}
          onPress={() => void form.handleSubmit()}
        />
        <Text style={st.catatan}>Data petani adalah milik petani — tidak dijual.</Text>
      </View>
    </SafeAreaView>
  );
}

function ramah(pesan: string): string {
  if (/401|403|Email atau password salah/i.test(pesan)) {
    return 'Email atau kata sandi salah. Coba lagi.';
  }
  return pesan;
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT, justifyContent: 'center' },
  kartu: { padding: 20, gap: 12 },
  logo: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: WINE,
    alignItems: 'center', justifyContent: 'center',
  },
  logoTeks: { fontSize: 28 },
  judul: { fontSize: 24, fontWeight: '800', color: INK },
  sub: { fontSize: 13, color: STONE, marginBottom: 4 },
  catatan: { fontSize: 11, color: STONE, textAlign: 'center', marginTop: 4 },
});
