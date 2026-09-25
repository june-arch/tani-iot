import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spinner } from 'heroui-native';
import { AppButton, AppCard, AppCardBody, AppCardTitle, AppInput, FieldError, pesanField } from '@/src/components/ui';
import { EmptyState } from '@/src/components/ui/AppState';
import { useDoctorViewModel } from '@/src/viewmodels/useDoctorViewModel';
import { formatSolusi } from '@/src/models/diagnosis';
import { INK, PARCHMENT, STONE } from '@/src/theme';

export default function DoctorScreen() {
  const vm = useDoctorViewModel();
  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <View style={st.header}>
        <Text style={st.judul}>Doctor Tanaman</Text>
        <Text style={st.sub}>Foto daun → diagnosis penyakit & solusi</Text>
      </View>
      <ScrollView contentContainerStyle={st.konten} showsVerticalScrollIndicator={false}>
        <View style={st.baris}>
          <View style={{ flex: 1 }}><AppButton judul="📷 Kamera" onPress={vm.dariKamera} /></View>
          <View style={{ flex: 1 }}><AppButton judul="🖼️ Galeri" variant="kedua" onPress={vm.dariGaleri} /></View>
        </View>
        {vm.imageUri ? (
          <AppCard>
            <Image source={{ uri: vm.imageUri }} style={st.foto} resizeMode="cover" />
            <AppButton judul="Hapus Foto ✕" variant="garis" size="sm" onPress={vm.hapusFoto} />
          </AppCard>
        ) : (
          <EmptyState ikon="🌿📸" judul="Belum ada foto" pesan="Ambil foto daun yang sakit dengan pencahayaan yang baik." />
        )}
        <vm.form.Field name="catatan">
          {(field) => (
            <AppInput label="Catatan (opsional)" placeholder="Contoh: bercak kuning di tepi daun..." multiline numberOfLines={3} value={field.state.value} onChangeText={field.handleChange} onBlur={field.handleBlur} error={pesanField(field)} />
          )}
        </vm.form.Field>
        {vm.imageUri && <AppButton judul="🔍 Diagnosa Sekarang" onPress={vm.diagnosa} loading={vm.isLoading} />}
        {vm.isLoading && (
          <AppCard><AppCardBody><View style={st.tengah}><Spinner size="lg" /><Text style={st.sub}>Menganalisis gambar...</Text></View></AppCardBody></AppCard>
        )}
        <FieldError pesan={vm.pesanError} />
        {vm.pesanError && <Text style={st.sub}>Pastikan backend berjalan & endpoint POST /api/ai/diagnose aktif</Text>}
        {vm.hasil && (
          <AppCard><AppCardBody>
            <AppCardTitle>Hasil Diagnosis</AppCardTitle>
            <HasilRow label="Diagnosis" nilai={vm.hasil.diagnosis} />
            {vm.hasil.confidence !== undefined && <HasilRow label="Kepercayaan" nilai={`${Math.round(vm.hasil.confidence > 1 ? vm.hasil.confidence : vm.hasil.confidence * 100)}%`} />}
            {vm.hasil.penyebab && <HasilRow label="Penyebab" nilai={vm.hasil.penyebab} />}
            {vm.hasil.solusi && <HasilRow label="Solusi" nilai={`• ${formatSolusi(vm.hasil.solusi)}`} />}
            {vm.hasil.pencegahan && <HasilRow label="Pencegahan" nilai={vm.hasil.pencegahan} />}
          </AppCardBody></AppCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HasilRow({ label, nilai }: { label: string; nilai: string }) {
  return (
    <View style={st.hasilRow}>
      <Text style={st.hasilLabel}>{label}</Text>
      <Text style={st.hasilNilai}>{nilai}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  judul: { fontSize: 22, fontWeight: '800', color: INK },
  sub: { fontSize: 12, color: STONE, textAlign: 'center' },
  konten: { padding: 16, gap: 14, paddingBottom: 32 },
  baris: { flexDirection: 'row', gap: 12 },
  foto: { width: '100%', height: 240, borderRadius: 12, marginBottom: 10 },
  tengah: { alignItems: 'center', gap: 10 },
  hasilRow: { gap: 4, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: PARCHMENT },
  hasilLabel: { fontSize: 11, fontWeight: '700', color: STONE, textTransform: 'uppercase' },
  hasilNilai: { fontSize: 13, color: INK, lineHeight: 18 },
});
