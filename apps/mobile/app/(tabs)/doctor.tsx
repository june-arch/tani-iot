import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import client from '@/src/api/client';

const PRIMARY = '#2E7D32';

type DiagnoseResult = {
  diagnosis: string;
  confidence?: number;
  penyebab?: string;
  solusi?: string[] | string;
  pencegahan?: string;
  cropSlug?: string;
};

function formatSolusi(v: DiagnoseResult['solusi']): string {
  if (!v) return '-';
  if (Array.isArray(v)) return v.join('\n• ');
  if (typeof v === 'string') return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export default function DoctorScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin Ditolak', 'Butuh izin galeri untuk memilih foto');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: false,
    });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setResult(null);
      setError(null);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin Ditolak', 'Butuh izin kamera');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setResult(null);
      setError(null);
    }
  };

  const handleDiagnose = async () => {
    if (!imageUri) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      // RN FormData file
      form.append('image', {
        uri: imageUri,
        name: 'tanaman.jpg',
        type: 'image/jpeg',
      } as any);

      const res = await client.post('/ai/diagnose', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      const payload = res.data?.data ?? res.data;
      // expected: { diagnosis, solusi, pencegahan, ... } or wrapped
      const mapped: DiagnoseResult = {
        diagnosis: payload?.diagnosis || payload?.hasil || payload?.message || JSON.stringify(payload),
        confidence: payload?.confidence,
        penyebab: payload?.penyebab || payload?.cause,
        solusi: payload?.solusi || payload?.solution || payload?.solusiList,
        pencegahan: payload?.pencegahan || payload?.prevention,
        cropSlug: payload?.cropSlug,
      };
      setResult(mapped);
    } catch (e: any) {
      setError(e?.message || 'Gagal melakukan diagnosis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Doctor Tanaman</Text>
        <Text style={styles.subtitle}>Foto daun → diagnosis penyakit & solusi</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={styles.actionRow}>
          <Pressable onPress={takePhoto} style={[styles.btn, styles.btnPrimary]}>
            <Text style={styles.btnPrimaryText}>📷 Kamera</Text>
          </Pressable>
          <Pressable onPress={pickFromLibrary} style={[styles.btn, styles.btnOutline]}>
            <Text style={styles.btnOutlineText}>🖼️ Galeri</Text>
          </Pressable>
        </View>

        {imageUri ? (
          <View style={styles.previewCard}>
            <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="cover" />
            <Pressable onPress={() => { setImageUri(null); setResult(null); setError(null); }} style={styles.removeBtn}>
              <Text style={styles.removeText}>Hapus Foto ✕</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyPreview}>
            <Text style={styles.emptyIcon}>🌿📸</Text>
            <Text style={styles.emptyText}>Belum ada foto</Text>
            <Text style={styles.muted}>Ambil foto daun yang sakit dengan pencahayaan yang baik</Text>
          </View>
        )}

        {imageUri ? (
          <Pressable onPress={handleDiagnose} disabled={loading} style={[styles.diagnoseBtn, loading && { opacity: 0.6 }]}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.diagnoseText}>🔍 Diagnosa Sekarang</Text>}
          </Pressable>
        ) : null}

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.muted}>Menganalisis gambar...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Gagal</Text>
            <Text style={styles.errorMsg}>{error}</Text>
            <Text style={styles.muted}>Pastikan backend http://localhost:3101/api berjalan & endpoint POST /api/ai/diagnose aktif</Text>
          </View>
        ) : null}

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Hasil Diagnosis</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Diagnosis</Text>
              <Text style={styles.resultValue}>{result.diagnosis}</Text>
            </View>
            {result.confidence != null ? (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Kepercayaan</Text>
                <Text style={styles.resultValue}>{Math.round(result.confidence * 100)}%</Text>
              </View>
            ) : null}
            {result.penyebab ? (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Penyebab</Text>
                <Text style={styles.resultValue}>{result.penyebab}</Text>
              </View>
            ) : null}
            {result.solusi ? (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Solusi</Text>
                <Text style={styles.resultValue}>• {formatSolusi(result.solusi)}</Text>
              </View>
            ) : null}
            {result.pencegahan ? (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Pencegahan</Text>
                <Text style={styles.resultValue}>{result.pencegahan}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFCF8' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: PRIMARY },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: PRIMARY },
  btnOutlineText: { color: PRIMARY, fontWeight: '700', fontSize: 14 },
  previewCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  previewImg: { width: '100%', height: 260 },
  removeBtn: { paddingVertical: 10, alignItems: 'center', backgroundColor: '#FEF2F2' },
  removeText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  emptyPreview: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
  },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  muted: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  diagnoseBtn: { backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  diagnoseText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  loadingCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  errorCard: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#FECACA', gap: 6 },
  errorTitle: { fontWeight: '700', color: '#DC2626' },
  errorMsg: { fontSize: 13, color: '#7F1D1D' },
  resultCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  resultTitle: { fontSize: 16, fontWeight: '800', color: PRIMARY },
  resultRow: { gap: 4, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  resultLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  resultValue: { fontSize: 13, color: '#111827', lineHeight: 18 },
});
