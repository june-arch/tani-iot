import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import client from '@/src/api/client';

const WINE = '#421d24';
const VIOLET = '#714cb6';
const LILAC = '#d4c7ff';
const PARCHMENT = '#f2f0eb';
const MIST = '#e3e3e2';
const INK = '#292827';
const STONE = '#666666';
const PAPER = '#ffffff';

type Sensor = { id: string; type?: string; tipe?: string; unit?: string; deviceId: string; isEnabled?: boolean; minThreshold?: number | null; maxThreshold?: number | null };

export default function SensorScreen() {
  const [filter, setFilter] = useState<'Semua' | 'Tanah' | 'Air' | 'Lingkungan'>('Semua');
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['sensor-mobile', filter],
    queryFn: async () => {
      const kebunsRaw = await client.get('/kebuns/my');
      const kebuns = kebunsRaw.data?.data ?? kebunsRaw.data ?? [];
      if (!kebuns.length) return { sensors: [] as any[], tandonPersen: null as number | null, tandonRaw: null };
      const allSensors: any[] = [];
      for (const k of kebuns) {
        try {
          const devRes = await client.get(`/kebuns/${k.id}/devices`);
          const devices = devRes.data?.data ?? devRes.data ?? [];
          for (const d of devices) for (const s of d.sensors ?? []) allSensors.push({ ...s, deviceNama: d.nama, kebunNama: k.nama ?? k.name });
        } catch {}
      }
      let tandonPersen: number | null = null;
      const tandon = allSensors.find((s) => ['WATER_LEVEL', 'TANDON', 'LEVEL'].some((x) => (s.type ?? s.tipe ?? '').toString().toUpperCase().includes(x)));
      if (tandon?.id) {
        try {
          const tel = await client.get(`/sensors/${tandon.id}/telemetry?limit=1`);
          const arr = tel.data?.data ?? tel.data ?? [];
          const v = Array.isArray(arr) ? arr[0]?.value : null;
          if (v != null) tandonPersen = Math.round(v);
        } catch {}
      }
      return { sensors: allSensors, tandonPersen, tandonRaw: tandon };
    },
  });

  const sensors = data?.sensors ?? [];
  const filtered = sensors.filter((s: any) => {
    const t = (s.type ?? s.tipe ?? '').toString().toUpperCase();
    if (filter === 'Semua') return true;
    if (filter === 'Tanah') return ['PH', 'NPK_N', 'NPK_P', 'NPK_K', 'SOIL_MOISTURE'].includes(t);
    if (filter === 'Air') return ['WATER_LEVEL', 'TDS_PPM', 'TDS', 'EC'].includes(t);
    if (filter === 'Lingkungan') return ['TEMP', 'HUMIDITY'].includes(t);
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensor & Monitoring</Text>
        <Text style={styles.subtitle}>Data real-time dari perangkat IoT — dinamis via MQTT</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} colors={[WINE]} />} showsVerticalScrollIndicator={false}>
        {/* Tandon dynamic */}
        <View style={styles.card}>
          <View style={styles.rowBetween}><Text style={styles.cardTitle}>💧 Tandon Air</Text><View style={[styles.badge, { backgroundColor: data?.tandonPersen != null && data.tandonPersen < 20 ? '#fee2e2' : LILAC, borderColor: data?.tandonPersen != null && data.tandonPersen < 20 ? '#fecaca' : VIOLET }]}><Text style={[styles.badgeText, { color: data?.tandonPersen != null && data.tandonPersen < 20 ? '#991b1b' : INK }]}>{data?.tandonPersen == null ? 'Tidak ada data' : data.tandonPersen < 20 ? 'Rendah' : 'Aman'}</Text></View></View>
          {isLoading ? <ActivityIndicator color={WINE} /> : (
            <>
              <Text style={styles.bigValue}>{data?.tandonPersen != null ? `${data.tandonPersen}%` : '—'}<Text style={styles.unit}> live</Text></Text>
              <View style={styles.barBg}><View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, data?.tandonPersen ?? 0))}%`, backgroundColor: WINE }]} /></View>
              <Text style={styles.muted}>{data?.tandonPersen != null ? `Level real-time dari sensor ${data.tandonRaw?.deviceNama ?? ''}` : 'Pasang sensor WATER_LEVEL untuk data'}</Text>
            </>
          )}
        </View>

        {/* Tab strip */}
        <View style={styles.tabStrip}>
          {(['Semua', 'Tanah', 'Air', 'Lingkungan'] as const).map((t) => {
            const active = filter === t;
            return (
              <Pressable key={t} onPress={() => setFilter(t)} style={[styles.tab, active && styles.tabActive]}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator color={WINE} /><Text style={styles.muted}>Memuat sensor...</Text></View>
        ) : isError ? (
          <View style={styles.center}><Text style={styles.errorText}>{(error as Error)?.message ?? 'Gagal'}</Text><Pressable onPress={() => refetch()} style={styles.btnWine}><Text style={styles.btnWineText}>Coba Lagi</Text></Pressable></View>
        ) : filtered.length === 0 ? (
          <View style={styles.card}><Text style={styles.emptyTitle}>Tidak ada sensor</Text><Text style={styles.muted}>Filter {filter} kosong — coba Semua atau cek kebun/device.</Text></View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((s: any) => (
              <View key={s.id} style={styles.sensorCard}>
                <Text style={styles.sensorIcon}>{s.type === 'PH' ? '🧪' : s.type?.includes('TDS') ? '🧂' : s.type?.includes('WATER') ? '💧' : s.type === 'TEMP' ? '🌡️' : s.type === 'HUMIDITY' ? '💦' : '🌱'}</Text>
                <Text style={styles.sensorLabel}>{s.type ?? s.tipe}</Text>
                <Text style={styles.sensorValue}>{s.unit ? `— ${s.unit}` : '—'}</Text>
                <Text style={styles.sensorSub}>{s.deviceNama ?? s.kebunNama ?? ''} • {s.isEnabled === false ? 'Nonaktif' : 'Aktif'}</Text>
                <View style={[styles.miniBadge, { backgroundColor: s.isEnabled === false ? '#fee2e2' : LILAC }]}><Text style={[styles.miniBadgeText, { color: s.isEnabled === false ? '#991b1b' : INK }]}>{s.isEnabled === false ? 'Offline' : 'Online'}</Text></View>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.mockNote}>Data dinamis dari /kebuns/my → /devices → /sensors/telemetry (bukan mock)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: INK },
  subtitle: { fontSize: 13, color: STONE, marginTop: 2 },
  card: { backgroundColor: PAPER, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: MIST, gap: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: INK },
  badge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  bigValue: { fontSize: 28, fontWeight: '800', color: INK },
  unit: { fontSize: 12, color: STONE },
  barBg: { height: 6, backgroundColor: MIST, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 6 },
  tabStrip: { flexDirection: 'row', backgroundColor: PAPER, borderRadius: 8, padding: 4, borderWidth: 1, borderColor: MIST, gap: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: PAPER },
  tabActive: { backgroundColor: LILAC },
  tabText: { fontSize: 12, fontWeight: '600', color: STONE },
  tabTextActive: { color: INK, fontWeight: '800' },
  center: { alignItems: 'center', padding: 24, gap: 8 },
  muted: { color: STONE, fontSize: 12, textAlign: 'center' },
  errorText: { color: '#991b1b', textAlign: 'center' },
  btnWine: { backgroundColor: WINE, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, alignSelf: 'center' },
  btnWineText: { color: PAPER, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sensorCard: { width: '48%', backgroundColor: PAPER, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: MIST, gap: 4 },
  sensorIcon: { fontSize: 20 },
  sensorLabel: { fontSize: 11, color: STONE, fontWeight: '700' },
  sensorValue: { fontSize: 13, fontWeight: '800', color: INK },
  sensorSub: { fontSize: 10, color: STONE },
  miniBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  miniBadgeText: { fontSize: 10, fontWeight: '700' },
  mockNote: { fontSize: 11, color: STONE, fontStyle: 'italic', textAlign: 'center' },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: INK, textAlign: 'center' },
});
