<!-- impeccable:product-schema 1 -->
# Tani IoT — PRODUCT.md

## Platform

- **Type:** `web` + `android` (adaptive)
- **Web:** Next.js 16 dashboard (admin + petani) — konfigurasi sensor, monitoring kebun/lahan, manajemen tanaman
- **Mobile:** React Native Expo 54 APK — monitoring lapangan, kontrol irigasi, Doctor Tani kamera
- **Backend:** NestJS 11 + Prisma 6 + Postgres 17 + MQTT (EMQX) + Redis + WebSocket
- **Deploy:** VPS dragon (101.50.2.190) — Postgres lokal, PM2 (`tani-be` :3101, `tani-web` :3100), EMQX :1884, Nginx + TLS

## Users

- **Petani pemilik kebun (OWNER):** Punya 1..N kebun, kelola lahan, tanam, sensor, irigasi, lihat Doctor Tani. Paling sering pakai HP di lapangan.
- **Admin kebun (ADMIN):** Diundang OWNER, kelola operasional harian kebun tertentu — planting, schedule pupuk, kalibrasi sensor.
- **Petugas lapangan (PETANI):** Eksekusi tugas — siram, pupuk, foto tanaman untuk diagnosa. Akses terbatas per-kebun.
- **Viewer / Penyuluh (VIEWER):** Read-only monitoring multi-kebun (dinas, koperasi, keluarga).
- **Superadmin (SUPERADMIN):** Kelola master data tanaman (60+ komoditas), user global, lihat semua kebun.

## Positioning

- **Untuk siapa:** Petani Indonesia yang kelola 1..N kebun (sawah tegal, pekarangan, hidroponik rumahan sampai kebun komersial) — bukan korporat agritech mahal.
- **Masalah:** Penyemaian gagal karena media tanam salah, jadwal pupuk vegetatif/generatif tidak tercatat, tandon kosong tidak ketahuan, irigasi manual lupa, pH/NPK/PPM tidak terpantau, hama telat ditangani.
- **Solusi:** Satu aplikasi yang kumpulkan pengetahuan budidaya lengkap per komoditas Indonesia + monitoring sensor realtime + irigasi otomatis + AI Doctor Tani dari foto — semua multi-kebun, full Bahasa Indonesia, jalan di HP Android murah.
- **Beda dari lain:** Fokus Indonesia (iklim tropis, ketinggian, komoditas lokal), multi-kebun sejak awal, BOM hardware murah transparan (bukan blackbox), offline-tolerant (MQTT QoS1 + queue).

## Constraints

- Koneksi kebun tidak stabil — MQTT harus QoS1 + retain + offline queue di ESP32 (SPIFFS), backend tahan disconnect.
- Sensor murah drift — butuh kalibrasi di dashboard + median filter (3 sample) di backend.
- Hardware belum ada — BOM harus jelas + firmware template siap flash (PlatformIO).
- Bahasa full Indonesia — semua UI, error, docs, AI output Indonesia. Tidak ada istilah teknis Inggris di UI petani.
- Satu VPS dragon dipakai bareng ekraf-sms/dragon-warriors — port harus terpisah (5433/3101/3100/1884), tidak boleh tabrakan.
- APK harus ringan (Expo) dan jalan di Android API 29+ (Xiaomi Mi 9T Pro sebagai device test).

## Brand Commitments

- Jujur soal biaya — BOM transparan, tidak ada hidden cost.
- Data petani adalah milik petani — tidak dijual, export kapan saja.
- Offline-first mindset — fitur kritis (jadwal pupuk, riwayat sensor 7 hari) tetap bisa dilihat tanpa internet (cache).
- Inklusif — UI besar, kontras AA, tidak butuh literasi digital tinggi untuk pakai.

## Evidence

- User request 12 poin (29-08-2026): penyemaian lengkap + media tanam, bibit vegetatif/generatif + takaran pupuk, tandon, solenoid irigasi otomatis, AI foto Doctor Tani, pH+hara, dashboard config sensor, APK RN + web BE, hidroponik, PPM, auth login, design impeccable, multi-kebun, full Indonesia, semua tanaman Indonesia (60+), VPS dragon, hardware belum ada.
- Komoditas: kurasi 60+ sayur+buah tropis (dataran rendah/tinggi) — sayur daun, sayur buah, umbi, buah — tiap entry butuh sowing + growing vegetatif/generatif + hidroponik guide.
- Sensor: tandon (ultrasonic JSN-SR04T), solenoid valve, pH tanah, NPK 3-in-1, EC/TDS PPM — semua via ESP32 → MQTT `tani/{kebunId}/{deviceId}/{sensorType}`.

## Success Metrics

- Petani bisa buat kebun → tambah lahan → tanam (pilih komoditas + metode tanah/hidroponik) → lihat timeline hari 0..panen dalam <3 menit (wizard).
- Telemetry sensor muncul di web + HP dalam <2 detik setelah publish MQTT.
- Irigasi otomatis jalan sesuai schedule/threshold tanpa manual trigger.
- Foto daun → diagnosis + solusi takaran spesifik dalam <10 detik.
- `designmd lint` 0 errors, `impeccable detect` 0, Lighthouse ≥90, APK install tanpa crash di API 29.

## Scope

- **In:** Multi-kebun CRUD, 60+ crop knowledge base, planting lifecycle, sensor registry + telemetry + threshold + kalibrasi, tandon/irigasi/pH/NPK/PPM, MQTT ingestion + WS realtime, irigasi schedule/auto, AI Doctor Tani, web dashboard + mobile APK, auth RBAC per-kebun, design system impeccable.
- **Out (fase 2):** Cuaca hyperlocal, marketplace panen, auto-dosing hidroponik tanpa konfirmasi, multi-bahasa, iOS.
