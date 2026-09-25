import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard, AppCardBody, AppChip, AppInput, nadaTandon, pesanField } from '@/src/components/ui';
import { EmptyState, ErrorState, LoadingState } from '@/src/components/ui/AppState';
import { useSensorViewModel } from '@/src/viewmodels/useSensorViewModel';
import { KATEGORI_SENSOR, ikonSensor, labelSensor } from '@/src/models/sensor';
import { INK, LILAC, MIST, PAPER, PARCHMENT, STONE, WINE } from '@/src/theme';

export default function SensorScreen() {
  const vm = useSensorViewModel();
  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <View style={st.header}>
        <Text style={st.judul}>Sensor & Monitoring</Text>
        <Text style={st.sub}>Data real-time dari perangkat IoT — dinamis via MQTT</Text>
      </View>
      <ScrollView contentContainerStyle={st.konten} refreshControl={<RefreshControl refreshing={vm.isRefetching} onRefresh={() => vm.refetch()} colors={[WINE]} />} showsVerticalScrollIndicator={false}>
        <AppCard><AppCardBody>
          <View style={st.baris}>
            <Text>💧</Text><Text style={st.kartuJudul}>Tandon Air</Text>
            <AppChip label={vm.tandonPersen === null ? 'Tidak ada data' : vm.tandonPersen < 20 ? 'Rendah' : 'Aman'} nada={nadaTandon(vm.tandonPersen)} />
          </View>
          {vm.isLoading ? <LoadingState pesan="Memuat sensor..." /> : (
            <>
              <Text style={st.besar}>{vm.tandonPersen !== null ? `${vm.tandonPersen}%` : '—'}<Text style={st.sub}> live</Text></Text>
              <View style={st.barLuar}><View style={[st.barIsi, { width: `${Math.max(0, Math.min(100, vm.tandonPersen ?? 0))}%` }]} /></View>
              <Text style={st.sub}>{vm.tandonPersen !== null ? `Level real-time dari sensor ${vm.tandonNama ?? ''}` : 'Pasang sensor WATER_LEVEL untuk data'}</Text>
            </>
          )}
        </AppCardBody></AppCard>
        <View style={st.tabStrip}>
          {KATEGORI_SENSOR.map((t) => (
            <TouchableOpacity key={t} onPress={() => vm.form.setFieldValue('kategori', t)} style={[st.tab, vm.kategori === t && st.tabAktif]}>
              <Text style={[st.tabTeks, vm.kategori === t && st.tabTeksAktif]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <vm.form.Field name="cari">
          {(field) => (
            <AppInput placeholder="Cari sensor / device..." value={field.state.value} onChangeText={field.handleChange} onBlur={field.handleBlur} returnKeyType="search" error={pesanField(field)} />
          )}
        </vm.form.Field>
        {vm.isLoading ? <LoadingState pesan="Memuat sensor..." /> :
          vm.isError ? <ErrorState pesan={vm.pesanError ?? 'Gagal memuat sensor'} onRetry={() => vm.refetch()} /> :
          vm.sensors.length === 0 ? <EmptyState ikon="📡" judul="Tidak ada sensor" pesan={`Filter ${vm.kategori} kosong — coba Semua atau cek kebun/device.`} /> : (
            <View style={st.grid}>
              {vm.sensors.map((s) => (
                <AppCard key={s.id} style={st.sensorKartu}>
                  <Text style={st.ikon}>{ikonSensor(s)}</Text>
                  <Text style={st.sensorLabel}>{labelSensor(s)}</Text>
                  <Text style={st.sensorNilai}>{s.unit ? `— ${s.unit}` : '—'}</Text>
                  <Text style={st.sub}>{s.deviceNama ?? s.kebunNama ?? ''} • {s.isEnabled === false ? 'Nonaktif' : 'Aktif'}</Text>
                  <AppChip label={s.isEnabled === false ? 'Offline' : 'Online'} nada={s.isEnabled === false ? 'bahaya' : 'aman'} />
                </AppCard>
              ))}
            </View>
          )}
        <Text style={st.catatan}>Data dinamis dari /kebuns/my → /devices → /sensors/telemetry (bukan mock)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  judul: { fontSize: 22, fontWeight: '800', color: INK },
  sub: { fontSize: 12, color: STONE, marginTop: 2 },
  konten: { padding: 16, gap: 14, paddingBottom: 32 },
  baris: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kartuJudul: { fontSize: 14, fontWeight: '800', color: INK, flex: 1 },
  besar: { fontSize: 28, fontWeight: '800', color: INK, marginTop: 4 },
  barLuar: { height: 6, backgroundColor: MIST, borderRadius: 6, overflow: 'hidden', marginVertical: 6 },
  barIsi: { height: 6, borderRadius: 6, backgroundColor: WINE },
  tabStrip: { flexDirection: 'row', backgroundColor: PAPER, borderRadius: 8, padding: 4, borderWidth: 1, borderColor: MIST, gap: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabAktif: { backgroundColor: LILAC },
  tabTeks: { fontSize: 12, fontWeight: '600', color: STONE },
  tabTeksAktif: { color: INK, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sensorKartu: { width: '48%', gap: 4 },
  ikon: { fontSize: 20 },
  sensorLabel: { fontSize: 11, color: STONE, fontWeight: '700' },
  sensorNilai: { fontSize: 13, fontWeight: '800', color: INK },
  catatan: { fontSize: 11, color: STONE, fontStyle: 'italic', textAlign: 'center' },
});
