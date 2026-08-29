import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#2E7D32';

export default function IrigasiScreen() {
  const [autoMode, setAutoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const handleSiram = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLastRun(new Date().toLocaleString('id-ID'));
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Irigasi</Text>
        <Text style={styles.subtitle}>Kontrol penyiraman otomatis & manual</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.cardTitle}>Mode Otomatis</Text>
              <Text style={styles.cardSub}>Siram berdasarkan jadwal & sensor</Text>
            </View>
            <Switch value={autoMode} onValueChange={setAutoMode} trackColor={{ true: PRIMARY }} />
          </View>
          <Text style={styles.hint}>{autoMode ? '✅ Irigasi otomatis aktif' : 'Manual — tekan tombol Siram'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Siram Manual</Text>
          <Text style={styles.cardSub}>Durasi 30 detik • Sumber: Tandon</Text>
          <Pressable
            onPress={handleSiram}
            disabled={loading}
            style={[styles.btnPrimary, loading && { opacity: 0.6 }]}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>💧 Siram Sekarang</Text>}
          </Pressable>
          {lastRun ? <Text style={styles.lastRun}>Terakhir: {lastRun} — Sukses</Text> : null}
          <Text style={styles.mockNote}>Mock — hubungkan Device IRRIGATION untuk kontrol nyata (POST /api/irrigation)</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Jadwal</Text>
          {[
            { jam: '06:00', durasi: '30 dtk', aktif: true },
            { jam: '18:00', durasi: '30 dtk', aktif: true },
            { jam: '12:00', durasi: '15 dtk', aktif: false },
          ].map((j) => (
            <View key={j.jam} style={styles.jadwalRow}>
              <Text style={styles.jadwalJam}>{j.jam}</Text>
              <Text style={styles.jadwalDur}>{j.durasi}</Text>
              <View style={[styles.badge, { backgroundColor: j.aktif ? '#E8F5E9' : '#F3F4F6' }]}>
                <Text style={[styles.badgeText, { color: j.aktif ? PRIMARY : '#6B7280' }]}>
                  {j.aktif ? 'Aktif' : 'Nonaktif'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Riwayat Irigasi</Text>
          {[
            { tgl: 'Hari ini 06:00', status: 'Sukses', sumber: 'Jadwal' },
            { tgl: 'Kemarin 18:00', status: 'Sukses', sumber: 'Manual' },
            { tgl: 'Kemarin 06:00', status: 'Batal — Tandon Kosong', sumber: 'Otomatis' },
          ].map((l, i) => (
            <View key={i} style={styles.logRow}>
              <Text style={styles.logDate}>{l.tgl}</Text>
              <Text style={[styles.logStatus, { color: l.status === 'Sukses' ? PRIMARY : '#DC2626' }]}>{l.status}</Text>
              <Text style={styles.logSrc}>{l.sumber}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFCF8' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  cardSub: { fontSize: 12, color: '#6B7280' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hint: { fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
  btnPrimary: { backgroundColor: PRIMARY, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  lastRun: { fontSize: 12, color: PRIMARY, textAlign: 'center', fontWeight: '600' },
  mockNote: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center' },
  jadwalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  jadwalJam: { fontSize: 14, fontWeight: '700', color: '#111827', width: 60 },
  jadwalDur: { fontSize: 13, color: '#6B7280', flex: 1 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  logDate: { fontSize: 12, color: '#374151', flex: 1 },
  logStatus: { fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'center' },
  logSrc: { fontSize: 11, color: '#6B7280' },
});
