import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import client from '@/src/api/client';

const PRIMARY = '#2E7D32';

type Kebun = {
  id: string;
  nama: string;
  lokasi: string;
  luas?: number | null;
  deskripsi?: string | null;
};

export default function KebunScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<Kebun[]>({
    queryKey: ['kebuns-my'],
    queryFn: async () => {
      const res = await client.get('/kebuns/my');
      const d = res.data?.data ?? res.data;
      return Array.isArray(d) ? d : [];
    },
    retry: false,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Kebun Saya</Text>
        <Text style={styles.subtitle}>Kelola lahan dan kebun Anda</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.muted}>Memuat kebun...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Gagal memuat</Text>
          <Text style={styles.muted}>{(error as Error)?.message || 'Periksa koneksi atau login dulu'}</Text>
          <Pressable onPress={() => refetch()} style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Coba Lagi</Text>
          </Pressable>
        </View>
      ) : !data || data.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🏡</Text>
          <Text style={styles.emptyTitle}>Belum ada kebun</Text>
          <Text style={styles.muted}>Anda belum memiliki kebun. Tambah kebun untuk mulai menanam.</Text>
          <Pressable
            onPress={() => {
              // placeholder CTA — backend requires auth; show toast-like feedback
              refetch();
            }}
            style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>+ Tambah Kebun</Text>
          </Pressable>
          <Text style={[styles.muted, { marginTop: 8, fontSize: 11 }]}>
            Butuh login untuk menambah kebun (POST /api/kebuns)
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <Text style={{ fontSize: 22 }}>🌾</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.nama}</Text>
                <Text style={styles.cardLoc}>{item.lokasi}</Text>
                {item.luas ? <Text style={styles.cardMeta}>Luas: {item.luas} m²</Text> : null}
                {item.deskripsi ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.deskripsi}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
          ListHeaderComponent={
            <Pressable onPress={() => refetch()} style={styles.addBtn}>
              <Text style={styles.addBtnText}>+ Tambah Kebun</Text>
            </Pressable>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFCF8' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  muted: { color: '#6B7280', fontSize: 13, textAlign: 'center' },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  btnPrimary: { backgroundColor: PRIMARY, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  addBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  addBtnText: { color: '#fff', fontWeight: '700' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
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
  cardLoc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardMeta: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  cardDesc: { fontSize: 12, color: '#4B5563', marginTop: 4 },
});
