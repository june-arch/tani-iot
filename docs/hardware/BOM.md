# BOM Hardware — Tani IoT (Multi-Kebun, 2025-2026)

> Harga estimasi marketplace Indonesia (Tokopedia/Shopee) per Agustus 2026. Belanja per-kebun, bisa cicil lahan.

## 1) Node Utama (per kebun — 1 unit, untuk tandon + gateway)

| # | Komponen | Spesifikasi | Estimasi | Catatan |
|---|----------|-------------|----------|---------|
| 1 | ESP32 DevKit v1 (30-pin) | WiFi + BLE, 3.3V | Rp 85.000 | Alternatif: ESP32-S3 jika butuh lebih pin |
| 2 | Box IP65 150x110x70mm | Plastik ABS, karet seal | Rp 35.000 | Untuk luar ruangan |
| 3 | Step-down LM2596 / MP1584 | 12V → 5V/3.3V 3A | Rp 15.000 | Dari adaptor 12V |
| 4 | Adaptor 12V 2A | Untuk solenoid + ESP | Rp 45.000 | Share dengan valve |
| 5 | Breadboard/PCB + kabel Dupont | - | Rp 20.000 | - |
| 6 | Baut, klem, seal | - | Rp 10.000 | - |
| **Subtotal Node** | | | **Rp 210.000** | |

## 2) Tandon — Monitoring Isi Air (per tandon)

| # | Komponen | Spesifikasi | Estimasi | Catatan |
|---|----------|-------------|----------|---------|
| 1 | JSN-SR04T waterproof ultrasonic | Jarak 25cm–4.5m, IP66 | Rp 120.000 | **Rekomendasi** — tahan hujan. Alternatif HC-SR04 (Rp 18rb) tapi tidak waterproof |
| 2 | Bracket + kabel 2.5m | Bawaan JSN-SR04T | — | Sudah include |
| 3 | Pelampung backup (opsional) | Switch level | Rp 25.000 | Fallback jika ultrasonic gagal |
| **Subtotal Tandon** | | | **Rp 120.000–145.000** | |

> Kalibrasi di dashboard: input `tinggiTandon` (cm) + `offsetSensor` (cm) → backend hitung `level% = (tinggi - jarak) / tinggi * 100`.

## 3) Irigasi — Selenoid Valve (per lahan/bedeng)

| # | Komponen | Spesifikasi | Estimasi | Catatan |
|---|----------|-------------|----------|---------|
| 1 | Relay 4-channel 5V | Optocoupler, untuk ESP32 | Rp 35.000 | 1 channel = 1 valve |
| 2 | Selenoid valve ½" 12V NC | Normal Close | Rp 110.000 | Per lahan 1 valve |
| 3 | Selang PE + fitting ½" | 5m + 2 fitting | Rp 30.000 | Sesuaikan lahan |
| 4 | Filter saringan ½" | - | Rp 20.000 | Cegah mampet |
| **Subtotal per Valve** | | | **Rp 195.000** | Jika 2 lahan = Rp 390.000 |

> Kontrol: `MQTT tani/{kebunId}/{deviceId}/solenoid/set` → `{"action":"OPEN","durationSec":300}`. Auto-close setelah durasi atau jika tandon <20%.

## 4) Tanah — pH + NPK + Suhu/Kelembaban (per lahan)

| # | Komponen | Spesifikasi | Estimasi | Catatan |
|---|----------|-------------|----------|---------|
| 1 | Sensor pH tanah RS485 | 4-20mA/Modbus, probe stainless | Rp 450.000 | Akurasi ±0.3 pH, tahan korosi |
| 2 | Sensor NPK 3-in-1 RS485 | N/P/K mg/kg, Modbus | Rp 550.000 | Bisa 1 probe untuk 3 unsur |
| 3 | DHT22 / SHT30 | Suhu & kelembaban udara | Rp 35.000 | DHT22 cukup, SHT30 lebih akurat |
| 4 | Converter RS485 → TTL | MAX485 module | Rp 15.000 | Jika ESP32 tanpa RS485 bawaan |
| **Subtotal Tanah** | | | **Rp 1.050.000** | Per lahan — bisa share 1 probe NPK digilir jika budget tipis |

> Alternatif murah: pH analog probe + modul pH-4502C (Rp 180rb) tapi perlu kalibrasi buffer sering dan tidak RS485 — **tidak rekomendasi** untuk kebun komersial.

## 5) Hidroponik — PPM/EC + pH Air (per tandon hidroponik)

| # | Komponen | Spesifikasi | Estimasi | Catatan |
|---|----------|-------------|----------|---------|
| 1 | Sensor TDS/EC RS485 | 0–2000 ppm, Modbus | Rp 350.000 | Konversi EC → PPM otomatis |
| 2 | Sensor pH air RS485 | Probe kaca, Modbus | Rp 380.000 | Beda dengan pH tanah |
| 3 | Sensor suhu air DS18B20 waterproof | -55..125°C | Rp 25.000 | Untuk kompensasi TDS |
| 4 | Pompa peristaltik 12V (opsional) | Untuk auto-dosing nutrisi A/B | Rp 180.000 | 2 unit (A & B) = Rp 360rb — **fase 2**, awal manual dulu |
| **Subtotal Hidroponik** | | | **Rp 755.000** | Tanpa pompa = Rp 755rb, dengan pompa Rp 1.115jt |

## 6) Estimasi Total per Skenario

| Skenario | Komponen | Total Estimasi |
|----------|----------|----------------|
| **Mini (1 kebun, 1 tandon, 2 lahan tanah)** | Node 210k + Tandon 120k + 2 Valve 390k + 1 Tanah 1.050jt (share probe, gilir lahan) | **Rp 1.770.000** |
| **Standar (1 kebun, 1 tandon, 3 lahan: 2 tanah + 1 hidroponik)** | Node 210k + Tandon 120k + 3 Valve 585k + 2 Tanah 1.050jt* + 1 Hidro 755k | **Rp 2.720.000** |
| **Lengkap (1 kebun, 2 tandon, 4 lahan: 3 tanah + 1 hidroponik + auto-dosing)** | Node 210k + 2 Tandon 240k + 4 Valve 780k + 3 Tanah 1.050jt* + 1 Hidro 1.115jt | **Rp 3.395.000** |

*Jika tiap lahan punya probe sendiri: +Rp 1.050jt per lahan tambahan.

> **Tips hemat:**
> - Awal cukup 1 probe pH+NPK untuk 2–3 lahan — pindah manual, catat di aplikasi.
> - Hidroponik rumahan bisa pakai TDS analog murah (Rp 45rb) — akurasi kurang tapi cukup untuk hobi.
> - Beli bertahap: tandon dulu → irigasi → tanah → hidroponik.

## 7) Daftar Belanja Cepat (Tokopedia keywords)

- `ESP32 DevKit v1 30pin`
- `JSN-SR04T waterproof ultrasonic`
- `Relay 4 channel 5V optocoupler`
- `Solenoid valve 12V 1/2 inch NC`
- `Sensor pH tanah RS485 Modbus`
- `Sensor NPK RS485 Modbus 3in1`
- `Sensor TDS EC RS485 Modbus`
- `MAX485 TTL RS485 converter`
- `Box IP65 150x110x70`

## 8) Yang TIDAK Perlu di BOM

- Raspberry Pi — overkill, ESP32 cukup.
- LoRa — tidak perlu jika ada WiFi di kebun (pakai WiFi extender jika jauh). LoRa hanya jika kebun >500m tanpa WiFi.
- Panel surya — opsional jika kebun tanpa listrik PLN (tambah Rp 400rb: panel 20W + baterai 12V 7Ah + SCC).

---

**Next:** Lihat `WIRING.md` untuk diagram kabel & `ESP32-FIRMWARE.md` untuk template sketch.
