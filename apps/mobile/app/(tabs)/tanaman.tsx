import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppChip, AppInput, pesanField } from '@/src/components/ui';
import { EmptyState, ErrorState, LoadingState } from '@/src/components/ui/AppState';
import { TanamanDetailModal } from '@/src/components/TanamanDetailModal';
import { useTanamanViewModel } from '@/src/viewmodels/useTanamanViewModel';
import { INK, LILAC, MIST, PAPER, PARCHMENT, STONE } from '@/src/theme';

export default function TanamanScreen() {
  const vm = useTanamanViewModel();
  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <View style={st.header}>
        <Text style={st.judul}>Daftar Tanaman</Text>
        <Text style={st.sub}>Pilih tanaman untuk lihat panduan lengkap</Text>
      </View>
      <View style={st.cari}>
        <vm.form.Field name="cari">
          {(field) => (
            <AppInput placeholder="Cari tanaman..." value={field.state.value} onChangeText={field.handleChange} onBlur={field.handleBlur} returnKeyType="search" error={pesanField(field)} />
          )}
        </vm.form.Field>
      </View>
      {vm.isLoading ? <LoadingState pesan="Memuat tanaman..." /> :
        vm.isError ? <ErrorState pesan={vm.pesanError ?? 'Gagal memuat data'} onRetry={() => vm.refetch()} /> :
        vm.crops.length === 0 ? <EmptyState ikon="🌱" judul="Tidak ada tanaman" pesan="Belum ada data atau tidak cocok dengan pencarian." /> : (
          <FlatList
            data={vm.crops}
            keyExtractor={(item) => item.id}
            contentContainerStyle={st.list}
            refreshing={vm.isRefetching}
            onRefresh={() => vm.refetch()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => vm.setTerpilih(item)}>
                <AppCard>
                  <View style={st.row}>
                    <View style={st.ikon}><Text style={{ fontSize: 22 }}>{item.category === 'BUAH' ? '🍓' : '🥬'}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={st.nama}>{item.name}</Text>
                      <Text style={st.subItalic}>{item.scientificName || item.slug}</Text>
                      <View style={st.baris}>
                        <AppChip label={item.category} nada="info" />
                        {item.iklimOptimal ? <Text style={st.sub}>{item.iklimOptimal}</Text> : null}
                      </View>
                      {item.description ? <Text numberOfLines={2} style={st.sub}>{item.description}</Text> : null}
                    </View>
                    <Text style={st.chev}>›</Text>
                  </View>
                </AppCard>
              </TouchableOpacity>
            )}
          />
        )}
      <TanamanDetailModal crop={vm.terpilih} onTutup={() => vm.setTerpilih(null)} />
      <View style={st.tombolBawah}>
        <AppButton judul="Muat Ulang" variant="kedua" size="sm" onPress={() => vm.refetch()} />
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  judul: { fontSize: 22, fontWeight: '800', color: INK },
  sub: { fontSize: 12, color: STONE, marginTop: 2 },
  subItalic: { fontSize: 12, color: STONE, fontStyle: 'italic' },
  cari: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { padding: 16, gap: 12, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ikon: { width: 44, height: 44, borderRadius: 10, backgroundColor: LILAC, alignItems: 'center', justifyContent: 'center' },
  nama: { fontSize: 15, fontWeight: '700', color: INK },
  baris: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  chev: { fontSize: 20, color: MIST, fontWeight: '600' },
  tombolBawah: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: PAPER, borderTopWidth: 1, borderTopColor: MIST },
});
