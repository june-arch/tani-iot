# Wiring Guide — Tani IoT (ESP32 → Sensor → Relay)

> Semua sensor RS485 pakai 2 kabel A/B, share 1 bus. ESP32 sebagai Modbus master.

## Diagram Umum (1 Kebun)

```
[Adaptor 12V 2A] ──12V──► [Solenoid Valve] ──► [Relay COM/NO] ──► GND
                └──12V──► [LM2596] ──5V──► [ESP32 VIN] ──3.3V──► [Sensor RS485 VCC]
                └──12V──► [JSN-SR04T VCC 5V]

[ESP32] ── GPIO16 (RX2) ◄── RO (MAX485)
        ── GPIO17 (TX2) ──► DI (MAX485)
        ── GPIO4  (DE/RE) ──► DE+RE (MAX485)
        ── GPIO5  ──► Relay IN1 (Valve Lahan 1)
        ── GPIO18 ──► Relay IN2 (Valve Lahan 2)
        ── GPIO19 ──► Relay IN3 (Valve Lahan 3 - hidroponik)
        ── GPIO21 (TRIG) ──► JSN-SR04T TRIG (jika pakai HC-SR04)
        ── GPIO22 (ECHO) ◄── JSN-SR04T ECHO
        ── GPIO23 ──► DHT22 DATA

[MAX485] ── A ──► [pH Tanah A] ──► [NPK A] ──► [TDS A] (bus paralel)
         ── B ──► [pH Tanah B] ──► [NPK B] ──► [TDS B]
         GND share semua sensor
```

## Pinout Detail ESP32 DevKit v1

| ESP32 Pin | Fungsi | Koneksi |
|-----------|--------|---------|
| VIN (5V) | Power in | LM2596 5V |
| GND | Ground | GND bus |
| GPIO16 (RX2) | UART2 RX | MAX485 RO |
| GPIO17 (TX2) | UART2 TX | MAX485 DI |
| GPIO4 | DE/RE control | MAX485 DE & RE (jumper) |
| GPIO5 | Relay 1 | Relay IN1 → Valve 1 |
| GPIO18 | Relay 2 | Relay IN2 → Valve 2 |
| GPIO19 | Relay 3 | Relay IN3 → Valve 3 |
| GPIO21 | Ultrasonic TRIG | JSN-SR04T Trig (5V logic, pakai divider jika perlu) |
| GPIO22 | Ultrasonic ECHO | JSN-SR04T Echo (5V → divider 1k/2k ke 3.3V) |
| GPIO23 | DHT22 | DATA (pull-up 10k ke 3.3V) |
| 3.3V | Sensor VCC | DHT22, MAX485 VCC |
| EN, BOOT | Flash | Tombol |

> **Catatan JSN-SR04T:** Mode serial (default) cukup 1 kabel ke RX — tidak perlu TRIG/ECHO terpisah. Jika pakai mode 1 (jarak serial 9600), hubungkan TX JSN ke GPIO16 via level shifter. Lebih simpel pakai HC-SR04 + TRIG/ECHO (tapi tidak waterproof).

## RS485 Bus (Modbus)

- **Topology:** Daisy-chain, bukan star. A→A→A, B→B→B.
- **Terminasi:** Resistor 120Ω di ujung bus (biasanya di pH dan TDS terakhir) — jumper di module RS485.
- **Alamat Modbus (default, ubah via software):**
  - pH tanah: `0x01`
  - NPK 3-in-1: `0x02`
  - TDS/EC: `0x03`
  - pH air: `0x04`
- **Baud:** 4800/9600 (samakan semua, default 4800 untuk NPK murah).
- **Power:** Sensor RS485 butuh 12V (cek datasheet) — jangan 3.3V! Ambil langsung dari adaptor 12V, bukan dari ESP32.

## Relay → Valve

- **Relay COM** → Adaptor 12V (+)
- **Relay NO** → Valve kabel 1
- **Valve kabel 2** → Adaptor 12V (-/GND)
- **NC** tidak dipakai (valve default close).
- **Flyback diode** sudah di relay module — tidak perlu tambahan.
- **Indikator:** LED relay nyala = valve OPEN.

## Power Budget

| Beban | Arus |
|-------|------|
| ESP32 | 150mA |
| JSN-SR04T | 30mA |
| pH RS485 | 50mA |
| NPK RS485 | 50mA |
| TDS RS485 | 50mA |
| Relay coil (1 aktif) | 70mA |
| Valve (saat open) | 300mA |
| **Total puncak** | **~700mA** |
| Adaptor 12V 2A | **Cukup (sisa 1.3A)** |

## MQTT Topic Convention

```
tani/{kebunId}/{deviceId}/water_level     → {"value": 72.5, "unit": "%", "ts": 1714000000}
tani/{kebunId}/{deviceId}/ph              → {"value": 6.2, "unit": "pH", "ts": ...}
tani/{kebunId}/{deviceId}/npk             → {"n": 120, "p": 45, "k": 80, "unit": "mg/kg", "ts": ...}
tani/{kebunId}/{deviceId}/ppm             → {"value": 950, "unit": "ppm", "ts": ...}
tani/{kebunId}/{deviceId}/temp            → {"value": 28.5, "unit": "C", "ts": ...}
tani/{kebunId}/{deviceId}/humidity        → {"value": 78, "unit": "%", "ts": ...}
tani/{kebunId}/{deviceId}/solenoid/status → {"state": "OPEN|CLOSE", "lahanId": "...", "ts": ...}
tani/{kebunId}/{deviceId}/solenoid/set    ← {"action": "OPEN|CLOSE", "durationSec": 300} (dari backend)
tani/{kebunId}/{deviceId}/status          → {"online": true, "rssi": -62, "uptime": 12345}
```

> `kebunId` ada di topic agar backend langsung tahu scope tanpa query device — ESP32 simpan `kebunId` + `deviceId` di Preferences (flash), diisi saat provisioning via BLE/AP config.

## Provisioning (WiFi + Identitas)

1. Flash firmware → ESP32 jadi AP `TaniIoT-XXXX` (password `tani12345`).
2. Hubungkan HP → buka `192.168.4.1` → form: WiFi SSID/pass, `kebunId`, `deviceId`, `mqttUrl`.
3. Simpan → ESP32 reboot → konek WiFi → konek MQTT → publish `status online`.

---

**Next:** `ESP32-FIRMWARE.md` untuk template kode.
