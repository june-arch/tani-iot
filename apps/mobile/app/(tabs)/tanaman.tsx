import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import client from '@/src/api/client';

// Types matching Prisma Crop + relations
type SowingGuide = {
  id: string;
  mediaTanam: string;
  durasiHari: number;
  suhuOptimal: string;
  kelembaban: string;
  langkah: string[] | unknown;
  siapTanamIndikator: string;
};
type GrowingGuide = {
  id: string;
  fase: 'VEGETATIF' | 'GENERATIF';
  pupuk: unknown;
  penyiraman: string;
  hama?: unknown;
  panenHariRange: string;
};
type HydroponicGuide = {
  id: string;
  sistem: string;
  ppmRange: string;
  phRange: string;
  nutrisi: unknown;
  durasiHari: number;
};
type Crop = {
  id: string;
  name: string;
  slug: string;
  category: string;
  scientificName?: string | null;
  description?: string | null;
  iklimOptimal?: string | null;
  ketinggianOptimal?: string | null;
  sowingGuides?: SowingGuide[];
  growingGuides?: GrowingGuide[];
  hydroponicGuides?: HydroponicGuide[];
};

const PRIMARY = '#2E7D32';
const ACCENT = '#F59E0B';

function formatJson(v: unknown): string {
  if (!v) return '-';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.join(', ');
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export default function TanamanScreen() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Crop | null>(null);

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<Crop[]>({
    queryKey: ['crops'],
    queryFn: async () => {
      const res = await client.get('/crops');
      // backend wraps: { sukses, data } or { data }
      const d = res.data?.data ?? res.data;
      return Array.isArray(d) ? d : d?.data ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.scientificName && c.scientificName.toLowerCase().includes(q))
    );
  }, [data, search]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Tanaman</Text>
        <Text style={styles.headerSub}>Pilih tanaman untuk lihat panduan lengkap</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          placeholder="Cari tanaman..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.muted}>Memuat tanaman...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{(error as Error)?.message || 'Gagal memuat data'}</Text>
          <Pressable onPress={() => refetch()} style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Coba Lagi</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyTitle}>Tidak ada tanaman</Text>
          <Text style={styles.muted}>
            {search ? `Tidak ditemukan untuk "${search}"` : 'Belum ada data tanaman'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelected(item)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
              <View style={styles.cardIcon}>
                <Text style={{ fontSize: 22 }}>{item.category === 'BUAH' ? '🍓' : '🥬'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSlug}>{item.scientificName || item.slug}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.category}</Text>
                  </View>
                  {item.iklimOptimal ? (
                    <Text style={styles.cardMeta}>{item.iklimOptimal}</Text>
                  ) : null}
                </View>
                {item.description ? (
                  <Text numberOfLines={2} style={styles.cardDesc}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selected?.name}</Text>
            <Pressable onPress={() => setSelected(null)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Tutup ✕</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
            {selected?.description ? <Text style={styles.modalDesc}>{selected.description}</Text> : null}
            {selected?.iklimOptimal || selected?.ketinggianOptimal ? (
              <View style={styles.infoRow}>
                {selected.iklimOptimal ? <Text style={styles.infoChip}>Iklim: {selected.iklimOptimal}</Text> : null}
                {selected.ketinggianOptimal ? (
                  <Text style={styles.infoChip}>Ketinggian: {selected.ketinggianOptimal}</Text>
                ) : null}
              </View>
            ) : null}

            {/* Sowing Guide */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌱 Panduan Semai (Sowing Guide)</Text>
              {selected?.sowingGuides && selected.sowingGuides.length > 0 ? (
                selected.sowingGuides.map((g) => (
                  <View key={g.id} style={styles.guideCard}>
                    <Text style={styles.guideLabel}>Media: {g.mediaTanam}</Text>
                    <Text style={styles.guideMeta}>
                      Durasi {g.durasiHari} hari • Suhu {g.suhuOptimal} • Kelembaban {g.kelembaban}
                    </Text>
                    {Array.isArray(g.langkah) ? (
                      <View style={{ marginTop: 8, gap: 4 }}>
                        {(g.langkah as string[]).map((s, i) => (
                          <Text key={i} style={styles.bullet}>
                            {i + 1}. {s}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.bullet}>{formatJson(g.langkah)}</Text>
                    )}
                    <Text style={[styles.guideMeta, { marginTop: 8, fontStyle: 'italic' }]}>
                      Siap tanam: {g.siapTanamIndikator}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.muted}>Belum ada panduan semai</Text>
              )}
            </View>

            {/* Growing Guides */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌿 Panduan Tumbuh</Text>
              {(['VEGETATIF', 'GENERATIF'] as const).map((fase) => {
                const guides = selected?.growingGuides?.filter((x) => x.fase === fase) ?? [];
                return (
                  <View key={fase} style={{ gap: 8 }}>
                    <Text style={styles.faseTitle}>{fase === 'VEGETATIF' ? 'Fase Vegetatif' : 'Fase Generatif'}</Text>
                    {guides.length > 0 ? (
                      guides.map((g) => (
                        <View key={g.id} style={styles.guideCard}>
                          <Text style={styles.guideLabel}>Panen: {g.panenHariRange}</Text>
                          <Text style={styles.guideMeta}>Penyiraman: {g.penyiraman}</Text>
                          <Text style={styles.guideMeta}>Pupuk: {formatJson(g.pupuk)}</Text>
                          {g.hama ? <Text style={styles.guideMeta}>Hama: {formatJson(g.hama)}</Text> : null}
                        </View>
                      ))
                    ) : (
                      <Text style={styles.muted}>Belum ada panduan {fase.toLowerCase()}</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Hidroponik */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💧 Panduan Hidroponik</Text>
              {selected?.hydroponicGuides && selected.hydroponicGuides.length > 0 ? (
                selected.hydroponicGuides.map((h) => (
                  <View key={h.id} style={styles.guideCard}>
                    <Text style={styles.guideLabel}>Sistem: {h.sistem}</Text>
                    <Text style={styles.guideMeta}>
                      PPM {h.ppmRange} • pH {h.phRange} • {h.durasiHari} hari
                    </Text>
                    <Text style={styles.guideMeta}>Nutrisi: {formatJson(h.nutrisi)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.muted}>Belum ada panduan hidroponik</Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFCF8' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1B1B1B' },
  headerSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  muted: { color: '#6B7280', fontSize: 13, textAlign: 'center' },
  errorText: { color: '#DC2626', textAlign: 'center' },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  btnPrimary: { backgroundColor: PRIMARY, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 4 },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cardSlug: { fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  badge: { backgroundColor: PRIMARY, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardMeta: { fontSize: 11, color: '#6B7280' },
  cardDesc: { fontSize: 12, color: '#4B5563', marginTop: 4 },
  chevron: { fontSize: 20, color: '#9CA3AF', fontWeight: '600' },
  modalSafe: { flex: 1, backgroundColor: '#FFFCF8' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', flex: 1 },
  closeBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  closeText: { fontWeight: '700', color: '#374151' },
  modalDesc: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoChip: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  faseTitle: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  guideCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  guideLabel: { fontSize: 13, fontWeight: '700', color: '#111827' },
  guideMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  bullet: { fontSize: 12, color: '#374151', lineHeight: 16 },
});
