# Katalog Sensor — Tani IoT

> Semua sensor yang dipakai aplikasi, dipetakan 1:1 ke tipe sensor di dashboard
> (`WATER_LEVEL`, `SOLENOID`, `PH`, `NPK_N`, `NPK_P`, `NPK_K`, `EC`, `TDS_PPM`,
> `TEMP`, `HUMIDITY`, `SOIL_MOISTURE`).
> Harga estimasi marketplace Indonesia (Tokopedia/Shopee) per 2026.
> Lihat juga: `BOM.md` (belanja per skenario), `WIRING.md` (kabel), `ESP32-FIRMWARE.md` (kode).

## Cara baca tiap entri

- **Tipe di aplikasi** — pilih ini saat Tambah Sensor di halaman Sensor.
- **Satuan (unit)** — isi otomatis di form, samakan agar grafik & threshold benar.
- **Threshold saran** — angka awal; sesuaikan di form threshold per kebun.

---

## 1) Tandon

### 1.1 Sensor Level Air Ultrasonik Waterproof
- **Tipe di aplikasi:** `WATER_LEVEL` · **Satuan:** `%`
- **Fungsi:** Ukur sisa isi tandon → persen, picu peringatan tandon rendah & auto-close irigasi.
- **Rekomendasi:** JSN-SR04T waterproof ultrasonic, jarak 25cm–4.5m, IP66 → **Rp 120.000**
- **Alternatif:** HC-SR04 (Rp 18rb) — murah tapi TIDAK waterproof, cepat rusak di luar ruangan.
- **Opsional:** pelampung switch level Rp 25rb sebagai fallback jika ultrasonik gagal.
- **Keyword:** `JSN-SR04T waterproof ultrasonic`
- **Threshold saran:** min 20 (peringatan Rendah di bawah 20%), max 100.
- **Kalibrasi:** input tinggi tandon (cm) + offset sensor di dashboard → `level% = (tinggi − jarak) / tinggi × 100`.

## 2) Irigasi

### 2.1 Selenoid Valve + Relay
- **Tipe di aplikasi:** `SOLENOID` · **Satuan:** `on/off`
- **Fungsi:** Buka/tutup air ke tiap lahan/bedeng, bisa otomatis by jadwal atau saat tandon cukup.
- **Rekomendasi:** Selenoid valve ½" 12V NC (Normal Close) → **Rp 110.000/valve** + Relay 4-channel 5V optocoupler → **Rp 35.000** (1 channel = 1 valve) + selang PE + fitting + filter ±Rp 50.000.
- **Keyword:** `Solenoid valve 12V 1/2 inch NC`, `Relay 4 channel 5V optocoupler`
- **Kontrol:** MQTT `tani/{kebunId}/{deviceId}/solenoid/set` → `{"action":"OPEN","durationSec":300}`. Auto-close setelah durasi atau jika tandon < 20%.
- **Catatan:** pakai adaptor 12V 2A (share dengan ESP via step-down), NC = aman mati listrik (air berhenti).

## 3) Tanah

### 3.1 Sensor pH Tanah RS485
- **Tipe di aplikasi:** `PH` · **Satuan:** `pH`
- **Fungsi:** Keasaman tanah (target umum 5.5–7.0 tergantung komoditas).
- **Rekomendasi:** probe stainless RS485/Modbus, akurasi ±0.3 pH, tahan korosi → **Rp 450.000**
- **Alternatif murah:** probe analog + modul pH-4502C (±Rp 180rb) — perlu kalibrasi buffer sering, TIDAK rekomendasi untuk kebun komersial.
- **Keyword:** `Sensor pH tanah RS485 Modbus`
- **Threshold saran:** min 5.5, max 7.5 (sesuaikan komoditas di panduan tanaman).

### 3.2 Sensor NPK 3-in-1 RS485
- **Tipe di aplikasi:** `NPK_N`, `NPK_P`, `NPK_K` (satu alat dibaca 3 unsur) · **Satuan:** `mg/kg`
- **Fungsi:** Nitrogen (daun), Fosfor (akar/bunga), Kalium (buah) — dasar rekomendasi pupuk Doctor Tani.
- **Rekomendasi:** NPK 3-in-1 RS485/Modbus → **Rp 550.000**
- **Keyword:** `Sensor NPK RS485 Modbus 3in1`
- **Threshold saran:** sesuaikan fase tanam (vegetatif butuh N tinggi, generatif butuh P-K).
- **Tips hemat:** 1 probe untuk 2–3 lahan — pindah manual, catat di aplikasi.

### 3.3 Sensor Kelembaban Tanah Kapasitif
- **Tipe di aplikasi:** `SOIL_MOISTURE` · **Satuan:** `%`
- **Fungsi:** Kadar air tanah → jadwal siram presisi, cegah busuk akar.
- **Rekomendasi:** capacitive soil moisture v1.2 (anti korosi, jangan yang resistif bergigi) → **Rp 25.000–35.000**
- **Keyword:** `capacitive soil moisture sensor v1.2`
- **Threshold saran:** min 30, max 80 (siram saat < 30%).

## 4) Hidroponik

### 4.1 Sensor TDS/EC RS485
- **Tipe di aplikasi:** `TDS_PPM` dan `EC` (satu alat, dua bacaan) · **Satuan:** `ppm` / `mS/cm`
- **Fungsi:** Kepekatan nutrisi (konversi EC → PPM otomatis). Wajib untuk hidroponik.
- **Rekomendasi:** TDS/EC RS485/Modbus 0–2000 ppm → **Rp 350.000**
- **Alternatif hobi:** TDS analog murah (±Rp 45rb) — akurasi kurang, cukup untuk rumahan.
- **Keyword:** `Sensor TDS EC RS485 Modbus`
- **Threshold saran:** 800–1200 ppm (fase vegetatif), 1200–1800 ppm (generatif) — sesuaikan komoditas.

### 4.2 Sensor pH Air
- **Tipe di aplikasi:** `PH` · **Satuan:** `pH`
- **Fungsi:** pH larutan nutrisi (beda probe dengan pH tanah!). Target hidroponik 5.5–6.5.
- **Rekomendasi:** pH air RS485 probe kaca → **Rp 380.000**
- **Keyword:** `Sensor pH air RS485` / `pH probe hidroponik`
- **Threshold saran:** min 5.5, max 6.5.

### 4.3 Sensor Suhu Air Waterproof
- **Tipe di aplikasi:** `TEMP` · **Satuan:** `°C`
- **Fungsi:** Suhu larutan — untuk kompensasi TDS + cegah akar busuk (air > 30°C bahaya).
- **Rekomendasi:** DS18B20 waterproof, −55..125°C → **Rp 25.000**
- **Keyword:** `DS18B20 waterproof`
- **Threshold saran:** min 18, max 30.

## 5) Lingkungan (Udara)

### 5.1 Sensor Suhu & Kelembaban Udara
- **Tipe di aplikasi:** `TEMP` dan `HUMIDITY` (satu alat, dua bacaan) · **Satuan:** `°C` / `%`
- **Fungsi:** Iklim mikro kebun — suhu/kelembaban ekstrem picu stres tanaman & jamur.
- **Rekomendasi:** DHT22 (±Rp 35rb, cukup) atau SHT30 (±Rp 60rb, lebih akurat).
- **Keyword:** `DHT22 AM2302`, `SHT30`
- **Threshold saran:** suhu 20–33°C, humidity 50–90%.

## 6) Otak & Pendukung (bukan sensor, tapi wajib)

| Komponen | Keyword | Estimasi |
|---|---|---|
| ESP32 DevKit v1 30-pin (WiFi+BLE) | `ESP32 DevKit v1 30pin` | Rp 85.000 |
| Box IP65 150x110x70 | `Box IP65 150x110x70` | Rp 35.000 |
| Step-down LM2596 + Adaptor 12V 2A | `LM2596 step down`, `Adaptor 12V 2A` | Rp 60.000 |
| Converter MAX485 TTL→RS485 | `MAX485 TTL RS485 converter` | Rp 15.000 |
| Kabel Dupont + PCB + baut/klem | — | Rp 30.000 |

> Tanpa MAX485, sensor RS485 di atas tidak bisa ngobrol dengan ESP32.

## Ringkasan paket awal (copy-paste belanja)

**Paket Mini — tandon + irigasi 2 lahan (±Rp 720rb):**
`ESP32 DevKit v1 30pin`, `Box IP65 150x110x70`, `Adaptor 12V 2A`, `JSN-SR04T waterproof ultrasonic`, `Relay 4 channel 5V optocoupler`, `Solenoid valve 12V 1/2 inch NC` ×2.

**+ Paket Tanah (±Rp 1.050jt):** `Sensor pH tanah RS485 Modbus`, `Sensor NPK RS485 Modbus 3in1`, `DHT22 AM2302`, `capacitive soil moisture sensor v1.2`, `MAX485 TTL RS485 converter`.

**+ Paket Hidroponik (±Rp 755rb):** `Sensor TDS EC RS485 Modbus`, `Sensor pH air RS485`, `DS18B20 waterproof`.
