import React from 'react';
import { StyleSheet, ScrollView, RefreshControl, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import client from '@/src/api/client';

// Superhuman tokens — sinkron web
const WINE = '#421d24';
const VIOLET = '#714cb6';
const LILAC = '#d4c7ff';
const PARCHMENT = '#f2f0eb';
const MIST = '#e3e3e2';
const INK = '#292827';
const STONE = '#666666';
const PAPER = '#ffffff';
const LAGOON = '#0c4243';

type Kebun = { id: string; nama?: string; name?: string; lokasi?: string; _count?: any; lahans?: any[]; devices?: any[] };

export default function DashboardScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard-mobile'],
    queryFn: async () => {
      const kebunsRaw = await client.get('/kebuns/my');
      const kebuns: Kebun[] = kebunsRaw.data?.data ?? kebunsRaw.data ?? [];
      if (kebuns.length === 0) return { kebuns: [], totalLahan: 0, totalDevices: 0, totalSensors: 0, tandonPersen: null as number | null, plantings: [] as any[] };
      const perKebun = await Promise.all(
        kebuns.map(async (k: any) => {
          const id = k.id;
          try {
            const [lahans, devices] = await Promise.all([
              client.get(`/kebuns/${id}/lahans`).then((r) => r.data?.data ?? r.data ?? []).catch(() => []),
              client.get(`/kebuns/${id}/devices`).then((r) => r.data?.data ?? r.data ?? []).catch(() => []),
            ]);
            return { lahans: Array.isArray(lahans) ? lahans.length : 0, devices: Array.isArray(devices) ? devices : [] };
          } catch { return { lahans: 0, devices: [] as any[] }; }
        })
      );
      const totalLahan = perKebun.reduce((a, b) => a + b.lahans, 0);
      const allDevices: any[] = perKebun.flatMap((x) => x.devices);
      const totalDevices = allDevices.length;
      const totalSensors = allDevices.reduce((a, d) => a + (d.sensors?.length ?? 0), 0);
      let tandonPersen: number | null = null;
      const tandonSensor = allDevices.flatMap((d) => d.sensors ?? []).find((s: any) => {
        const t = (s.type ?? s.tipe ?? '').toString().toLowerCase();
        return t.includes('water') || t.includes('tandon') || t.includes('level');
      });
      if (tandonSensor?.id) {
        try {
          const tel = await client.get(`/sensors/${tandonSensor.id}/telemetry?limit=1`);
          const arr = tel.data?.data ?? tel.data ?? [];
          const val = Array.isArray(arr) ? arr[0]?.value : tel.data?.data?.[0]?.value;
          if (val != null) tandonPersen = Math.round(val);
        } catch {}
      }
      let plantings: any[] = [];
      try {
        const pr = await client.get('/plantings');
        plantings = pr.data?.data ?? pr.data ?? [];
      } catch {}
      return { kebuns, totalLahan, totalDevices, totalSensors, tandonPersen, plantings };
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}><ActivityIndicator color={WINE} /><Text style={styles.muted}>Memuat ringkasan...</Text></View>
      </SafeAreaView>
    );
  }
  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>⚠️</Text><Text style={styles.emptyTitle}>Gagal memuat</Text><Text style={styles.muted}>{(error as Error)?.message ?? 'Coba lagi'}</Text>
          <Pressable onPress={() => refetch()} style={styles.btnWine}><Text style={styles.btnWineText}>Muat Ulang</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }
  const d = data!;
  const tandonVal = d.tandonPersen !== null ? `${d.tandonPersen}%` : '—';
  const tandonOk = d.tandonPersen !== null && d.tandonPersen >= 20;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} colors={[WINE]} />} showsVerticalScrollIndicator={false}>
        {/* Header editorial */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}><Text style={{ color: PAPER, fontWeight: '800' }}>🌾</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Tani IoT</Text>
            <Text style={styles.heroSub}>Sawah terasering, data real-time</Text>
          </View>
          <View style={styles.pillLilac}><Text style={styles.pillLilacText}>{d.kebuns.length} kebun</Text></View>
        </View>

        {/* Trust strip */}
        <View style={styles.strip}>
          {[
            { k: `${d.kebuns.length}`, l: 'kebun' },
            { k: `${d.totalLahan}`, l: 'lahan' },
            { k: `${d.totalDevices}`, l: 'device' },
            { k: `${d.totalSensors}`, l: 'sensor' },
            { k: tandonVal, l: 'tandon' },
            { k: `${d.plantings.length}`, l: 'rencana' },
          ].map((s) => (
            <View key={s.l} style={styles.stripCell}><Text style={styles.stripK}>{s.k}</Text><Text style={styles.stripL}>{s.l}</Text></View>
          ))}
        </View>

        {/* Tandon card — floating glass */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconLilac}><Text>💧</Text></View>
            <Text style={styles.cardTitle}>Tandon Air</Text>
            <View style={[styles.badge, { backgroundColor: tandonOk ? '#d4f5e2' : '#fee2e2', borderColor: tandonOk ? '#a7e8c2' : '#fecaca' }]}>
              <Text style={[styles.badgeText, { color: tandonOk ? '#14532d' : '#991b1b' }]}>{d.tandonPersen === null ? 'Tidak ada data' : tandonOk ? 'Aman' : 'Rendah'}</Text>
            </View>
          </View>
          <Text style={styles.bigValue}>{tandonVal}<Text style={styles.unit}> {d.tandonPersen !== null ? '' : ''}</Text></Text>
          <View style={styles.barBg}><View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, d.tandonPersen ?? 0))}%`, backgroundColor: WINE }]} /></View>
          <Text style={styles.mutedSmall}>{d.totalDevices} device terdaftar • live telemetry</Text>
          <Pressable onPress={() => router.push('/(tabs)/sensor')} style={styles.btnWine}><Text style={styles.btnWineText}>Lihat Sensor</Text></Pressable>
          <Pressable onPress={() => router.push('/(tabs)/kebun')} style={styles.btnLilac}><Text style={styles.btnLilacText}>Kelola Kebun</Text></Pressable>
        </View>

        {/* Kalender preview */}
        <View style={styles.card}>
          <View style={styles.cardHeader}><View style={styles.iconLilac}><Text>📅</Text></View><Text style={styles.cardTitle}>Kalender Tanam</Text><Text style={styles.mutedSmall}>{d.plantings.length} rencana</Text></View>
          {d.plantings.length === 0 ? (
            <Text style={styles.muted}>Belum ada rencana — catat semai di web untuk prediksi tanam & panen.</Text>
          ) : (
            d.plantings.slice(0, 3).map((p: any) => (
              <View key={p.id} style={styles.plantRow}>
                <Text style={styles.plantName}>{p.cropName ?? p.crop?.name ?? 'Tanaman'} • {p.lahan?.nama ?? '—'}</Text>
                <Text style={styles.mutedSmall}>Semai {p.tanggalSemai ? new Date(p.tanggalSemai).toLocaleDateString('id-ID') : '—'} → Panen {p.prediksi?.panenAvg ? new Date(p.prediksi.panenAvg).toLocaleDateString('id-ID') : '—'}</Text>
              </View>
            ))
          )}
          <Pressable onPress={() => router.push('/(tabs)/tanaman')} style={styles.linkViolet}><Text style={styles.linkVioletText}>Lihat panduan tanaman ›</Text></Pressable>
        </View>

        {/* Dark band */}
        <View style={styles.darkBand}>
          <Text style={styles.darkTitle}>Irigasi jalan sendiri.{'\n'}Petani tinggal panen.</Text>
          <Text style={styles.darkSub}>Solenoid otomatis via MQTT QoS1 • Offline queue SPIFFS</Text>
          <Pressable onPress={() => router.push('/(tabs)/irigasi')} style={styles.btnPaper}><Text style={styles.btnPaperText}>Atur Irigasi</Text></Pressable>
        </View>

        {/* Actions */}
        <View style={styles.grid2}>
          {[
            { label: 'Kebun', sub: 'Kelola lahan', route: '/(tabs)/kebun' as const, icon: '🏡' },
            { label: 'Sensor', sub: 'Threshold & kalibrasi', route: '/(tabs)/sensor' as const, icon: '📡' },
            { label: 'Tanaman', sub: '60+ komoditas', route: '/(tabs)/tanaman' as const, icon: '🌱' },
            { label: 'Doctor', sub: 'Diagnosa foto daun', route: '/(tabs)/doctor' as const, icon: '🩺' },
          ].map((a) => (
            <Pressable key={a.label} onPress={() => router.push(a.route)} style={styles.actionCard}>
              <Text style={styles.actionIcon}>{a.icon}</Text><Text style={styles.actionTitle}>{a.label}</Text><Text style={styles.mutedSmall}>{a.sub}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  muted: { color: STONE, fontSize: 13, textAlign: 'center' },
  mutedSmall: { color: STONE, fontSize: 11, marginTop: 4 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: INK },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: PAPER, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: MIST },
  heroIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: WINE, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 16, fontWeight: '800', color: INK },
  heroSub: { fontSize: 11, color: STONE },
  pillLilac: { backgroundColor: LILAC, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pillLilacText: { fontSize: 11, fontWeight: '700', color: INK },
  strip: { flexDirection: 'row', backgroundColor: PAPER, borderRadius: 16, borderWidth: 1, borderColor: MIST, overflow: 'hidden' },
  stripCell: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRightWidth: 1, borderRightColor: MIST },
  stripK: { fontSize: 14, fontWeight: '800', color: INK },
  stripL: { fontSize: 10, color: STONE, textTransform: 'uppercase' },
  card: { backgroundColor: PAPER, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: MIST, gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconLilac: { width: 28, height: 28, borderRadius: 8, backgroundColor: LILAC, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: INK, flex: 1 },
  badge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  bigValue: { fontSize: 28, fontWeight: '800', color: INK },
  unit: { fontSize: 14, color: STONE },
  barBg: { height: 6, backgroundColor: MIST, borderRadius: 6, overflow: 'hidden', marginTop: 4 },
  barFill: { height: 6, borderRadius: 6 },
  btnWine: { backgroundColor: WINE, borderRadius: 16, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  btnWineText: { color: PAPER, fontWeight: '700' },
  btnLilac: { backgroundColor: LILAC, borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: INK },
  btnLilacText: { color: INK, fontWeight: '700' },
  plantRow: { borderWidth: 1, borderColor: MIST, borderRadius: 10, padding: 10, backgroundColor: PARCHMENT, gap: 2 },
  plantName: { fontSize: 13, fontWeight: '700', color: INK },
  linkViolet: { marginTop: 4 },
  linkVioletText: { color: VIOLET, fontWeight: '600', fontSize: 13 },
  darkBand: { backgroundColor: LAGOON, borderRadius: 16, padding: 16, gap: 8 },
  darkTitle: { fontSize: 18, fontWeight: '800', color: PAPER, lineHeight: 22 },
  darkSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  btnPaper: { backgroundColor: PAPER, borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  btnPaperText: { color: INK, fontWeight: '700' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '48%', backgroundColor: PAPER, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: MIST, gap: 4 },
  actionIcon: { fontSize: 20 },
  actionTitle: { fontSize: 13, fontWeight: '700', color: INK },
});
