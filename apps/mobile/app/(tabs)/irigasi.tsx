import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Switch } from 'heroui-native';
import { AppButton, AppCard, AppCardBody, AppInput, pesanField } from '@/src/components/ui';
import { FieldError } from '@/src/components/ui';
import { LoadingState } from '@/src/components/ui/AppState';
import { useIrigasiViewModel } from '@/src/viewmodels/useIrigasiViewModel';
import { DANGER, INK, PARCHMENT, STONE, WINE } from '@/src/theme';

export default function IrigasiScreen() {
  const vm = useIrigasiViewModel();
  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <View style={st.header}>
        <Text style={st.judul}>Irigasi</Text>
        <Text style={st.sub}>Kontrol penyiraman dinamis — tandon check & MQTT real</Text>
      </View>
      <ScrollView contentContainerStyle={st.konten} refreshControl={<RefreshControl refreshing={vm.isRefetching} onRefresh={() => vm.refetch()} colors={[WINE]} />} showsVerticalScrollIndicator={false}>
        <AppCard><AppCardBody>
          <View style={st.baris}>
            <View style={{ flex: 1 }}><Text style={st.kartuJudul}>Mode Otomatis</Text><Text style={st.sub}>Siram berdasarkan jadwal & sensor</Text></View>
            <Switch isSelected={vm.modeOtomatis} onSelectedChange={vm.setModeOtomatis} />
          </View>
          <Text style={st.hint}>{vm.modeOtomatis ? '✅ Irigasi otomatis aktif (schedule via cron)' : 'Manual — atur durasi lalu tekan Siram'}</Text>
          {!vm.adaKebun && <Text style={st.sub}>Belum ada kebun — buat di tab Kebun dulu</Text>}
        </AppCardBody></AppCard>
        <AppCard><AppCardBody>
          <Text style={st.kartuJudul}>Siram Manual</Text>
          <Text style={st.sub}>{vm.lahanAktif ? `${vm.lahanAktif.nama} • ${vm.kebunAktif?.nama ?? ''}` : 'Pilih lahan dulu'}</Text>
          <vm.form.Field name="durasiDetik">
            {(field) => (
              <AppInput label="Durasi (detik)" placeholder="30" keyboardType="numeric" value={field.state.value} onChangeText={field.handleChange} onBlur={field.handleBlur} error={pesanField(field)} />
            )}
          </vm.form.Field>
          <AppButton judul="💧 Siram Sekarang" onPress={vm.siram} loading={vm.isMenyiram} disabled={!vm.lahanAktif} />
          {vm.siramSukses && <Text style={st.sukses}>Sukses — MQTT OPEN dikirim</Text>}
          <FieldError pesan={vm.pesanSiramError} />
          <Text style={st.hint}>Real API POST /irrigation/trigger — tandon WATER_LEVEL &lt;20% otomatis batal</Text>
        </AppCardBody></AppCard>
        <AppCard><AppCardBody>
          <Text style={st.kartuJudul}>Riwayat Irigasi (dinamis)</Text>
          {vm.logsLoading ? <LoadingState pesan="Memuat log..." /> :
            vm.logs.length === 0 ? <Text style={st.sub}>Belum ada log — siram sekali untuk lihat</Text> :
            vm.logs.slice(0, 5).map((l, i) => (
              <View key={l.id ?? i} style={st.logRow}>
                <Text style={st.logTgl}>{l.createdAt ? new Date(l.createdAt).toLocaleString('id-ID') : l.tgl ?? '—'}</Text>
                <Text style={[st.logStatus, { color: l.status === 'SUKSES' ? WINE : DANGER }]}>{l.status ?? '—'}</Text>
                <Text style={st.sub}>{l.source ?? l.sumber ?? '—'}</Text>
              </View>
            ))}
        </AppCardBody></AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  judul: { fontSize: 22, fontWeight: '800', color: INK },
  sub: { fontSize: 12, color: STONE },
  konten: { padding: 16, gap: 14, paddingBottom: 32 },
  baris: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kartuJudul: { fontSize: 14, fontWeight: '800', color: INK },
  hint: { fontSize: 11, color: STONE, fontStyle: 'italic' },
  sukses: { fontSize: 12, color: WINE, textAlign: 'center', fontWeight: '600' },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, gap: 8 },
  logTgl: { fontSize: 12, color: INK, flex: 1 },
  logStatus: { fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'center' },
});
