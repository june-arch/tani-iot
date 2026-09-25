import { Linking, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, AppCardBody } from '@/src/components/ui';
import { INK, LILAC, MIST, PAPER, STONE, VIOLET, WINE } from '@/src/theme';
import {
  formatUkuran,
  unduhUrl,
  type RilisMobile,
} from '@/src/services/rilisService';

type Props = {
  rilis: RilisMobile;
  onTutup: () => void;
};

export function UpdateBanner({ rilis, onTutup }: Props) {
  const unduh = () => {
    void Linking.openURL(unduhUrl(rilis)).catch(() => undefined);
  };

  return (
    <AppCard style={st.kartu}>
      <AppCardBody>
        <View style={st.baris}>
          <View style={st.ikon}>
            <Text>⬆️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.judul}>Versi baru v{rilis.versionName} tersedia</Text>
            <Text style={st.kecil}>
              {formatUkuran(rilis.fileSize)} • {rilis.downloadCount}x diunduh
            </Text>
          </View>
          <View style={st.lencana}>
            <Text style={st.lencanaTeks}>BARU</Text>
          </View>
        </View>
        {rilis.changelog ? (
          <Text style={st.catatan} numberOfLines={3}>
            {rilis.changelog}
          </Text>
        ) : null}
        <Text style={st.kecil}>
          Unduh APK → izinkan “instal aplikasi yang tidak dikenal” → buka file untuk
          memperbarui.
        </Text>
        <View style={st.tombol}>
          <AppButton judul="Unduh Sekarang" onPress={unduh} />
          <AppButton judul="Nanti" variant="garis" onPress={onTutup} />
        </View>
      </AppCardBody>
    </AppCard>
  );
}

const st = StyleSheet.create({
  kartu: { borderColor: VIOLET, borderWidth: 1, backgroundColor: PAPER },
  baris: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ikon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: LILAC,
    alignItems: 'center',
    justifyContent: 'center',
  },
  judul: { fontSize: 14, fontWeight: '800', color: INK },
  kecil: { fontSize: 11, color: STONE, marginTop: 2 },
  lencana: {
    backgroundColor: WINE,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lencanaTeks: { color: PAPER, fontSize: 10, fontWeight: '800' },
  catatan: {
    fontSize: 12,
    color: INK,
    backgroundColor: '#f2f0eb',
    borderWidth: 1,
    borderColor: MIST,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    lineHeight: 18,
  },
  tombol: { gap: 8, marginTop: 10 },
});
