import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { rilisService, type RilisMobile } from '../services/rilisService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type StatusUpdate = {
  memeriksa: boolean;
  rilis: RilisMobile | null;
  adaUpdate: boolean;
  periksaUlang: () => void;
};

function kodeAplikasi(): number {
  // Buildnumber native (versionCode Android). Di Expo Go nilainya null → fallback 0
  // agar server tetap mengembalikan rilis terbaru untuk dibandingkan manual.
  const build = Application.nativeBuildVersion;
  const kode = build ? parseInt(build, 10) : NaN;
  return Number.isFinite(kode) ? kode : 0;
}

function namaVersiAplikasi(): string {
  return (
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    '1.0.0'
  );
}

async function kirimNotifikasiLokal(rilis: RilisMobile) {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pembaruan-apk', {
        name: 'Pembaruan APK',
        importance: Notifications.AndroidImportance.DEFAULT,
        description: 'Pemberitahuan versi baru aplikasi Tani IoT',
      });
    }
    const izin = await Notifications.getPermissionsAsync();
    let status = izin.status;
    if (status !== 'granted') {
      const minta = await Notifications.requestPermissionsAsync();
      status = minta.status;
    }
    if (status !== 'granted') return;

    const kunci = `notified_apk_${rilis.id}`;
    const sudah = await SecureStore.getItemAsync(kunci).catch(() => null);
    if (sudah) return; // jangan spam untuk versi yang sama

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Tani IoT v${rilis.versionName} tersedia`,
        body: rilis.changelog
          ? rilis.changelog.slice(0, 120)
          : 'Buka aplikasi untuk mengunduh versi terbaru.',
        data: { rilisId: rilis.id, versionCode: rilis.versionCode },
      },
      trigger: null,
    });
    await SecureStore.setItemAsync(kunci, '1').catch(() => undefined);
  } catch {
    // Notifikasi gagal (mis. Expo Go / izin ditolak) — banner in-app tetap tampil.
  }
}

/**
 * Cek rilis terbaru backend sekali saat layar dibuka.
 * Menampilkan banner bila versionCode server > versionCode aplikasi,
 * sekaligus menjadwalkan notifikasi lokal (1x per versi).
 */
export function useAppUpdate(): StatusUpdate {
  const [memeriksa, setMemeriksa] = useState(true);
  const [rilis, setRilis] = useState<RilisMobile | null>(null);
  const [adaUpdate, setAdaUpdate] = useState(false);
  const [putaran, setPutaran] = useState(0);

  const periksaUlang = useCallback(() => setPutaran((p) => p + 1), []);

  useEffect(() => {
    let batal = false;
    (async () => {
      setMemeriksa(true);
      try {
        const kode = kodeAplikasi();
        const data = await rilisService.terbaru(kode);
        if (batal || !data) {
          if (!batal) setMemeriksa(false);
          return;
        }
        // Bandingkan manual: server bisa tidak tahu kode kita (Expo Go = 0).
        const perlu = data.versionCode > kode;
        // Bila versionCode tak tersedia (dev), bandingkan nama versi.
        const versiApp = namaVersiAplikasi();
        const perluNama =
          !Number.isFinite(parseInt(Application.nativeBuildVersion ?? '', 10)) &&
          data.versionName !== versiApp;
        const update = perlu || perluNama || data.adaPembaruan === true;
        if (!batal) {
          setRilis(data);
          setAdaUpdate(update);
          if (update) void kirimNotifikasiLokal(data);
        }
      } catch {
        if (!batal) {
          setRilis(null);
          setAdaUpdate(false);
        }
      } finally {
        if (!batal) setMemeriksa(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, [putaran]);

  return { memeriksa, rilis, adaUpdate, periksaUlang };
}
