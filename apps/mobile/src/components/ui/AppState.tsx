import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Spinner } from 'heroui-native';
import { INK, PARCHMENT, STONE, WINE } from '@/src/theme';
import { AppButton } from './AppButton';
import { AppCard } from './AppCard';

export function LoadingState({ pesan }: { pesan: string }) {
  return (
    <View style={st.tengah}>
      <Spinner size="lg" />
      <Text style={st.muted}>{pesan}</Text>
    </View>
  );
}

export function ErrorState({
  pesan,
  onRetry,
  labelRetry = 'Coba Lagi',
}: {
  pesan: string;
  onRetry: () => void;
  labelRetry?: string;
}) {
  return (
    <View style={st.tengah}>
      <Text style={st.ikon}>⚠️</Text>
      <Text style={st.judul}>Gagal memuat</Text>
      <Text style={st.muted}>{pesan}</Text>
      <AppButton judul={labelRetry} onPress={onRetry} />
    </View>
  );
}

export function EmptyState({ ikon, judul, pesan, anak }: { ikon: string; judul: string; pesan: string; anak?: ReactNode }) {
  return (
    <AppCard style={st.kartu}>
      <Text style={st.ikon}>{ikon}</Text>
      <Text style={st.judul}>{judul}</Text>
      <Text style={st.muted}>{pesan}</Text>
      {anak}
    </AppCard>
  );
}

const st = StyleSheet.create({
  tengah: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10, backgroundColor: PARCHMENT },
  kartu: { alignItems: 'center', padding: 24, gap: 8 },
  ikon: { fontSize: 44, textAlign: 'center' },
  judul: { fontSize: 16, fontWeight: '700', color: INK, textAlign: 'center' },
  muted: { color: STONE, fontSize: 13, textAlign: 'center' },
});

export const WARNA_UTAMA = WINE;
