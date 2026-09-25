import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KebunFormModal } from '@/src/components/KebunFormModal';
import { AppButton, AppCard, AppInput, pesanField } from '@/src/components/ui';
import { EmptyState, ErrorState, LoadingState } from '@/src/components/ui/AppState';
import { useAuthStore } from '@/src/stores/auth';
import { useKebunViewModel } from '@/src/viewmodels/useKebunViewModel';
import { INK, LILAC, PARCHMENT, STONE } from '@/src/theme';

export default function KebunScreen() {
  const vm = useKebunViewModel();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [formTerlihat, setFormTerlihat] = useState(false);

  function bukaForm() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setFormTerlihat(true);
  }

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <View style={st.header}>
        <Text style={st.judul}>Kebun Saya</Text>
        <Text style={st.sub}>Kelola lahan dan kebun Anda</Text>
      </View>
      <View style={st.cari}>
        <vm.form.Field name="cari">
          {(field) => (
            <AppInput
              placeholder="Cari kebun..."
              value={field.state.value}
              onChangeText={field.handleChange}
              onBlur={field.handleBlur}
              returnKeyType="search"
              error={pesanField(field)}
            />
          )}
        </vm.form.Field>
      </View>
      {vm.isLoading ? <LoadingState pesan="Memuat kebun..." /> :
        vm.isError ? <ErrorState pesan={vm.pesanError ?? 'Periksa koneksi atau login dulu'} onRetry={() => vm.refetch()} /> :
        vm.kebuns.length === 0 ? (
          <EmptyState ikon="🏡" judul="Belum ada kebun"
            pesan={vm.total === 0 ? 'Anda belum memiliki kebun. Tambah kebun untuk mulai menanam.' : 'Tidak cocok dengan pencarian.'}
            anak={isAuthenticated
              ? <AppButton judul="+ Tambah Kebun" onPress={bukaForm} />
              : <AppButton judul="Masuk untuk menambah kebun" onPress={() => router.push('/login')} />} />
        ) : (
          <FlatList
            data={vm.kebuns}
            keyExtractor={(item) => item.id}
            contentContainerStyle={st.list}
            refreshing={vm.isRefetching}
            onRefresh={() => vm.refetch()}
            ListHeaderComponent={<AppButton judul="+ Tambah Kebun" onPress={bukaForm} />}
            renderItem={({ item }) => (
              <AppCard>
                <View style={st.row}>
                  <View style={st.ikon}><Text style={{ fontSize: 22 }}>🌾</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.nama}>{item.nama}</Text>
                    <Text style={st.sub}>{item.lokasi}</Text>
                    {item.luas ? <Text style={st.sub}>Luas: {item.luas} m²</Text> : null}
                    {item.deskripsi ? <Text style={st.sub} numberOfLines={2}>{item.deskripsi}</Text> : null}
                  </View>
                </View>
              </AppCard>
            )}
          />
        )}
      <KebunFormModal
        terlihat={formTerlihat}
        onTutup={() => setFormTerlihat(false)}
        onSimpan={(input) => vm.tambah.mutateAsync(input)}
        menyimpan={vm.tambah.isPending}
        pesanGalat={vm.pesanTambah}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  judul: { fontSize: 22, fontWeight: '800', color: INK },
  sub: { fontSize: 12, color: STONE, marginTop: 2 },
  cari: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { padding: 16, gap: 12, paddingBottom: 24 },
  row: { flexDirection: 'row', gap: 12 },
  ikon: { width: 44, height: 44, borderRadius: 10, backgroundColor: LILAC, alignItems: 'center', justifyContent: 'center' },
  nama: { fontSize: 15, fontWeight: '700', color: INK },
});
