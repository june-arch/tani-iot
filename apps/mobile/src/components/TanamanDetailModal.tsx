import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton, AppCard, AppCardBody, AppChip } from '@/src/components/ui';
import { formatPanduan, type Crop } from '@/src/models/tanaman';
import { INK, MIST, PAPER, PARCHMENT, STONE, WINE } from '@/src/theme';

export function TanamanDetailModal({ crop, onTutup }: { crop: Crop | null; onTutup: () => void }) {
  return (
    <Modal visible={crop !== null} animationType="slide" onRequestClose={onTutup}>
      <SafeAreaView style={st.safe} edges={['top', 'bottom']}>
        <View style={st.header}>
          <Text style={st.judul}>{crop?.name ?? ''}</Text>
          <AppButton judul="Tutup ✕" variant="kedua" size="sm" onPress={onTutup} />
        </View>
        <ScrollView contentContainerStyle={st.konten} showsVerticalScrollIndicator={false}>
          {crop?.description ? <Text style={st.desc}>{crop.description}</Text> : null}
          <View style={st.chipRow}>
            {crop?.iklimOptimal ? <AppChip label={`Iklim: ${crop.iklimOptimal}`} nada="info" /> : null}
            {crop?.ketinggianOptimal ? <AppChip label={`Ketinggian: ${crop.ketinggianOptimal}`} nada="info" /> : null}
          </View>
          <AppCard><AppCardBody>
            <Text style={st.seksi}>🌱 Panduan Semai</Text>
            {(crop?.sowingGuides ?? []).length === 0 && <Text style={st.sub}>Belum ada panduan semai</Text>}
            {(crop?.sowingGuides ?? []).map((g) => (
              <View key={g.id} style={st.panduan}>
                <Text style={st.panduanJudul}>Media: {g.mediaTanam}</Text>
                <Text style={st.sub}>Durasi {g.durasiHari} hari • Suhu {g.suhuOptimal} • {g.kelembaban}</Text>
                <Text style={st.sub}>Siap tanam: {g.siapTanamIndikator}</Text>
              </View>
            ))}
          </AppCardBody></AppCard>
          <AppCard><AppCardBody>
            <Text style={st.seksi}>🌿 Panduan Tumbuh</Text>
            {(['VEGETATIF', 'GENERATIF'] as const).map((fase) => {
              const daftar = (crop?.growingGuides ?? []).filter((x) => x.fase === fase);
              return (
                <View key={fase} style={{ gap: 6 }}>
                  <Text style={st.fase}>{fase === 'VEGETATIF' ? 'Fase Vegetatif' : 'Fase Generatif'}</Text>
                  {daftar.length === 0 && <Text style={st.sub}>Belum ada panduan {fase.toLowerCase()}</Text>}
                  {daftar.map((g) => (
                    <View key={g.id} style={st.panduan}>
                      <Text style={st.panduanJudul}>Panen: {g.panenHariRange}</Text>
                      <Text style={st.sub}>Siram: {g.penyiraman} • Pupuk: {formatPanduan(g.pupuk)}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </AppCardBody></AppCard>
          <AppCard><AppCardBody>
            <Text style={st.seksi}>💧 Panduan Hidroponik</Text>
            {(crop?.hydroponicGuides ?? []).length === 0 && <Text style={st.sub}>Belum ada panduan hidroponik</Text>}
            {(crop?.hydroponicGuides ?? []).map((h) => (
              <View key={h.id} style={st.panduan}>
                <Text style={st.panduanJudul}>Sistem: {h.sistem}</Text>
                <Text style={st.sub}>PPM {h.ppmRange} • pH {h.phRange} • {h.durasiHari} hari • Nutrisi: {formatPanduan(h.nutrisi)}</Text>
              </View>
            ))}
          </AppCardBody></AppCard>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PARCHMENT },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: PAPER, borderBottomWidth: 1, borderBottomColor: MIST },
  judul: { fontSize: 18, fontWeight: '800', color: INK, flex: 1 },
  konten: { padding: 16, gap: 12 },
  desc: { fontSize: 13, color: STONE, lineHeight: 18 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seksi: { fontSize: 14, fontWeight: '800', color: INK },
  fase: { fontSize: 13, fontWeight: '700', color: WINE },
  panduan: { backgroundColor: PARCHMENT, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: MIST },
  panduanJudul: { fontSize: 13, fontWeight: '700', color: INK },
  sub: { fontSize: 12, color: STONE, marginTop: 2 },
});
