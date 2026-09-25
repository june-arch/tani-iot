import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AppButton, AppCard, AppCardBody, AppCardTitle, AppChip, nadaTandon } from '@/src/components/ui';
import { ErrorState, LoadingState } from '@/src/components/ui/AppState';
import { UpdateBanner } from '@/src/components/UpdateBanner';
import { useAppUpdate } from '@/src/hooks/useAppUpdate';
import { useDashboardViewModel } from '@/src/viewmodels/useDashboardViewModel';
import { INK, LAGOON, MIST, PAPER, PARCHMENT, STONE, WINE } from '@/src/theme';

const AKSI = [
  { label: 'Kebun', sub: 'Kelola lahan', route: '/(tabs)/kebun', ikon: '🏡' },
  { label: 'Sensor', sub: 'Threshold & kalibrasi', route: '/(tabs)/sensor', ikon: '📡' },
  { label: 'Tanaman', sub: '60+ komoditas', route: '/(tabs)/tanaman', ikon: '🌱' },
  { label: 'Doctor', sub: 'Diagnosa foto daun', route: '/(tabs)/doctor', ikon: '🩺' },
] as const;

export default function DashboardScreen() {
  const router = useRouter();
  const vm = useDashboardViewModel();
  const update = useAppUpdate();
  const [bannerTutup, setBannerTutup] = useState(false);
  if (vm.isLoading) return <SafeAreaView style={st.safe} edges={['top']}><LoadingState pesan="Memuat ringkasan..." /></SafeAreaView>;
  if (vm.isError) return <SafeAreaView style={st.safe} edges={['top']}><ErrorState pesan={vm.pesanError ?? 'Coba lagi'} onRetry={() => vm.refetch()} labelRetry="Muat Ulang" /></SafeAreaView>;
  const d = vm.ringkasan;
  const tandonTxt = d.tandonPersen !== null ? `${d.tandonPersen}%` : '—';
  const stats = [`${d.kebuns.length}|kebun`, `${d.totalLahan}|lahan`, `${d.totalDevices}|device`, `${d.totalSensors}|sensor`, `${tandonTxt}|tandon`, `${d.plantings.length}|rencana`];
  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <ScrollView contentContainerStyle={st.konten} refreshControl={<RefreshControl refreshing={vm.isRefetching} onRefresh={() => vm.refetch()} colors={[WINE]} />} showsVerticalScrollIndicator={false}>
        {update.adaUpdate && update.rilis && !bannerTutup ? (
          <UpdateBanner rilis={update.rilis} onTutup={() => setBannerTutup(true)} />
        ) : null}
        <AppCard><AppCardBody>
          <View style={st.hero}>
            <View style={st.heroIkon}><Text>🌾</Text></View>
            <View style={{ flex: 1 }}><Text style={st.heroJudul}>Tani IoT</Text><Text style={st.kecil}>Sawah terasering, data real-time</Text></View>
            <AppChip label={`${d.kebuns.length} kebun`} nada="info" />
          </View>
          <View style={st.strip}>{stats.map((s) => { const [k, l] = s.split('|'); return <View key={l} style={st.sel}><Text style={st.selK}>{k}</Text><Text style={st.selL}>{l}</Text></View>; })}</View>
        </AppCardBody></AppCard>
        <AppCard><AppCardBody>
          <View style={st.baris}><Text>💧</Text><AppCardTitle>Tandon Air</AppCardTitle><AppChip label={d.tandonPersen === null ? 'Tidak ada data' : d.tandonPersen >= 20 ? 'Aman' : 'Rendah'} nada={nadaTandon(d.tandonPersen)} /></View>
          <Text style={st.besar}>{tandonTxt}</Text>
          <View style={st.barLuar}><View style={[st.barIsi, { width: `${Math.max(0, Math.min(100, d.tandonPersen ?? 0))}%` }]} /></View>
          <Text style={st.kecil}>{d.totalDevices} device terdaftar • live telemetry</Text>
          <AppButton judul="Lihat Sensor" onPress={() => router.push('/(tabs)/sensor')} />
          <AppButton judul="Kelola Kebun" variant="kedua" onPress={() => router.push('/(tabs)/kebun')} />
        </AppCardBody></AppCard>
        <AppCard><AppCardBody>
          <View style={st.baris}><Text>📅</Text><AppCardTitle>Kalender Tanam</AppCardTitle><Text style={st.kecil}>{d.plantings.length} rencana</Text></View>
          {d.plantings.length === 0 ? <Text style={st.kecil}>Belum ada rencana — catat semai di web untuk prediksi tanam & panen.</Text> :
            d.plantings.slice(0, 3).map((p) => <View key={p.id} style={st.tanamRow}><Text style={st.tanamNama}>{p.cropName ?? p.crop?.name ?? 'Tanaman'} • {p.lahan?.nama ?? '—'}</Text><Text style={st.kecil}>Semai {p.tanggalSemai ? new Date(p.tanggalSemai).toLocaleDateString('id-ID') : '—'} → Panen {p.prediksi?.panenAvg ? new Date(p.prediksi.panenAvg).toLocaleDateString('id-ID') : '—'}</Text></View>)}
        </AppCardBody></AppCard>
        <View style={st.gelap}>
          <Text style={st.gelapJudul}>Irigasi jalan sendiri.{'\n'}Petani tinggal panen.</Text>
          <Text style={st.gelapSub}>Solenoid otomatis via MQTT QoS1 • Offline queue SPIFFS</Text>
          <AppButton judul="Atur Irigasi" variant="kedua" onPress={() => router.push('/(tabs)/irigasi')} />
        </View>
        <View style={st.grid}>{AKSI.map((a) => <TouchableOpacity key={a.label} onPress={() => router.push(a.route)} style={st.aksi}><Text style={st.aksiIkon}>{a.ikon}</Text><Text style={st.aksiJudul}>{a.label}</Text><Text style={st.kecil}>{a.sub}</Text></TouchableOpacity>)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT },
  konten: { padding: 16, gap: 14, paddingBottom: 32 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroIkon: { width: 36, height: 36, borderRadius: 10, backgroundColor: WINE, alignItems: 'center', justifyContent: 'center' },
  heroJudul: { fontSize: 16, fontWeight: '800', color: INK },
  kecil: { fontSize: 11, color: STONE },
  strip: { flexDirection: 'row', marginTop: 10, borderWidth: 1, borderColor: MIST, borderRadius: 10, overflow: 'hidden' },
  sel: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRightWidth: 1, borderRightColor: MIST },
  selK: { fontSize: 13, fontWeight: '800', color: INK },
  selL: { fontSize: 9, color: STONE, textTransform: 'uppercase' },
  baris: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  besar: { fontSize: 28, fontWeight: '800', color: INK, marginTop: 4 },
  barLuar: { height: 6, backgroundColor: MIST, borderRadius: 6, overflow: 'hidden', marginVertical: 6 },
  barIsi: { height: 6, borderRadius: 6, backgroundColor: WINE },
  tanamRow: { borderWidth: 1, borderColor: MIST, borderRadius: 10, padding: 10, backgroundColor: PARCHMENT, gap: 2 },
  tanamNama: { fontSize: 13, fontWeight: '700', color: INK },
  gelap: { backgroundColor: LAGOON, borderRadius: 16, padding: 16, gap: 8 },
  gelapJudul: { fontSize: 18, fontWeight: '800', color: PAPER, lineHeight: 22 },
  gelapSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  aksi: { width: '48%', backgroundColor: PAPER, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: MIST, gap: 4 },
  aksiIkon: { fontSize: 20 },
  aksiJudul: { fontSize: 13, fontWeight: '700', color: INK },
});
