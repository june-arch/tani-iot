import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/src/api/client';

const WINE = '#421d24';
const VIOLET = '#714cb6';
const LILAC = '#d4c7ff';
const PARCHMENT = '#f2f0eb';
const MIST = '#e3e3e2';
const INK = '#292827';
const STONE = '#666666';
const PAPER = '#ffffff';

export default function IrigasiScreen() {
  const qc = useQueryClient();
  const [autoMode, setAutoMode] = useState(false);

  const { data: kebunData } = useQuery({
    queryKey: ['irigasi-kebuns'],
    queryFn: async () => {
      const r = await client.get('/kebuns/my');
      return r.data?.data ?? r.data ?? [];
    },
  });
  const firstKebun = kebunData?.[0];
  const { data: lahanData } = useQuery({
    queryKey: ['irigasi-lahans', firstKebun?.id],
    enabled: !!firstKebun?.id,
    queryFn: async () => {
      const r = await client.get(`/kebuns/${firstKebun.id}/lahans`);
      return r.data?.data ?? r.data ?? [];
    },
  });
  const firstLahan = lahanData?.[0];

  const { data: logsData, isLoading: logsLoading, refetch, isRefetching } = useQuery({
    queryKey: ['irigasi-logs', firstKebun?.id],
    enabled: !!firstKebun?.id,
    queryFn: async () => {
      const r = await client.get(`/irrigation/logs?kebunId=${firstKebun.id}&limit=10`);
      return r.data?.data ?? r.data ?? r.data?.logs ?? [];
    },
  });
  const logs: any[] = Array.isArray(logsData) ? logsData : logsData?.data ?? [];

  const trigger = useMutation({
    mutationFn: async () => {
      if (!firstKebun?.id || !firstLahan?.id) throw new Error('Belum ada kebun/lahan');
      const r = await client.post('/irrigation/trigger', { kebunId: firstKebun.id, lahanId: firstLahan.id, durationSec: 30, source: 'MANUAL' });
      return r.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['irigasi-logs'] }); },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Irigasi</Text>
        <Text style={styles.subtitle}>Kontrol penyiraman dinamis — tandon check & MQTT real</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} colors={[WINE]} />} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>Mode Otomatis</Text>
              <Text style={styles.cardSub}>Siram berdasarkan jadwal & sensor</Text>
            </View>
            <Switch value={autoMode} onValueChange={setAutoMode} trackColor={{ true: VIOLET, false: MIST }} thumbColor={autoMode ? PAPER : INK} />
          </View>
          <Text style={styles.hint}>{autoMode ? '✅ Irigasi otomatis aktif (schedule via cron)' : 'Manual — tekan Siram'}</Text>
          {!firstKebun && <Text style={styles.muted}>Belum ada kebun — buat di tab Kebun dulu</Text>}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Siram Manual</Text>
          <Text style={styles.cardSub}>{firstLahan ? `${firstLahan.nama ?? 'Lahan'} • 30 dtk • ${firstKebun?.nama ?? ''}` : 'Pilih lahan dulu'}</Text>
          <Pressable onPress={() => trigger.mutate()} disabled={trigger.isPending || !firstLahan} style={[styles.btnWine, (trigger.isPending || !firstLahan) && { opacity: 0.6 }]}>
            {trigger.isPending ? <ActivityIndicator color={PAPER} /> : <Text style={styles.btnText}>💧 Siram Sekarang</Text>}
          </Pressable>
          {trigger.isSuccess ? <Text style={styles.success}>Sukses — MQTT OPEN dikirim</Text> : null}
          {trigger.isError ? <Text style={styles.error}>{(trigger.error as Error)?.message ?? 'Gagal'}</Text> : null}
          <Text style={styles.mockNote}>Real API POST /irrigation/trigger — cek tandon WATER_LEVEL &lt;20% otomatis batal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Riwayat Irigasi (dinamis)</Text>
          {logsLoading ? <ActivityIndicator color={WINE} /> : logs.length === 0 ? <Text style={styles.muted}>Belum ada log — siram sekali untuk lihat</Text> : logs.slice(0,5).map((l: any, i: number) => (
            <View key={l.id ?? i} style={styles.logRow}>
              <Text style={styles.logDate}>{l.createdAt ? new Date(l.createdAt).toLocaleString('id-ID') : l.tgl ?? '—'}</Text>
              <Text style={[styles.logStatus, { color: l.status === 'SUKSES' ? WINE : l.status === 'BATAL_TANDON_KOSONG' ? VIOLET : '#DC2626' }]}>{l.status ?? '—'}</Text>
              <Text style={styles.logSrc}>{l.source ?? l.sumber ?? '—'}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: INK },
  subtitle: { fontSize: 13, color: STONE, marginTop: 2 },
  card: { backgroundColor: PAPER, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: MIST, gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: INK },
  cardSub: { fontSize: 12, color: STONE },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hint: { fontSize: 12, color: STONE, fontStyle: 'italic' },
  btnWine: { backgroundColor: WINE, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnText: { color: PAPER, fontWeight: '700', fontSize: 14 },
  success: { fontSize: 12, color: WINE, textAlign: 'center', fontWeight: '600' },
  error: { fontSize: 12, color: '#991b1b', textAlign: 'center' },
  muted: { fontSize: 12, color: STONE, textAlign: 'center' },
  mockNote: { fontSize: 11, color: STONE, fontStyle: 'italic', textAlign: 'center' },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: MIST },
  logDate: { fontSize: 12, color: INK, flex: 1 },
  logStatus: { fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'center' },
  logSrc: { fontSize: 11, color: STONE },
});
