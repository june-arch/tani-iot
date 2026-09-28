// Katalog sensor Tani IoT — data statis (tak perlu backend).
// Foto: Unsplash/Pexels terverifikasi + fallback ikon bila URL mati.
export type KatalogKategori =
  | "Tandon"
  | "Irigasi"
  | "Tanah"
  | "Hidroponik"
  | "Lingkungan"
  | "Node";

export const KATEGORI_LIST: KatalogKategori[] = [
  "Tandon",
  "Irigasi",
  "Tanah",
  "Hidroponik",
  "Lingkungan",
  "Node",
];

export type KatalogSensor = {
  slug: string;
  nama: string;
  tipeApps: string[];
  kategori: KatalogKategori;
  satuan: string;
  fungsi: string;
  rekomendasi: string;
  harga: string;
  alternatif?: string;
  keyword: string;
  threshold: string;
  tips: string;
  imageUrl: string;
};

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export const KATALOG_SENSORS: KatalogSensor[] = [
  {
    slug: "jsn-sr04t",
    nama: "Sensor Level Air Ultrasonik Waterproof",
    tipeApps: ["WATER_LEVEL"],
    kategori: "Tandon",
    satuan: "%",
    fungsi: "Ukur sisa isi tandon → persen. Picu peringatan tandon rendah & auto-close irigasi.",
    rekomendasi: "JSN-SR04T waterproof ultrasonic, jarak 25cm–4.5m, IP66",
    harga: "Rp 120.000",
    alternatif: "HC-SR04 (Rp 18rb) — murah tapi TIDAK waterproof, cepat rusak di luar ruangan.",
    keyword: "JSN-SR04T waterproof ultrasonic",
    threshold: "min 20, max 100 — peringatan Rendah di bawah 20%",
    tips: "Input tinggi tandon (cm) + offset sensor di dashboard → level% = (tinggi − jarak) / tinggi × 100.",
    imageUrl: U("1439405326854-014607f694d7"),
  },
  {
    slug: "solenoid-valve",
    nama: "Selenoid Valve + Relay",
    tipeApps: ["SOLENOID"],
    kategori: "Irigasi",
    satuan: "on/off",
    fungsi: "Buka/tutup air ke tiap lahan/bedeng — manual, terjadwal, atau otomatis saat tandon cukup.",
    rekomendasi: "Selenoid valve ½\" 12V NC + Relay 4-channel 5V optocoupler + selang PE & filter",
    harga: "Rp 195.000/lahan",
    alternatif: "Valve ¾\" bila debit besar — sesuaikan pipa kebun.",
    keyword: "Solenoid valve 12V 1/2 inch NC",
    threshold: "Aktif bila tandon ≥ 20%, auto-close setelah durasi atau tandon rendah.",
    tips: "Pakai adaptor 12V 2A (share dengan ESP via step-down). NC = aman mati listrik, air berhenti.",
    imageUrl: U("1738598665698-7fd7af4b5e0c"),
  },
  {
    slug: "ph-tanah",
    nama: "Sensor pH Tanah RS485",
    tipeApps: ["PH"],
    kategori: "Tanah",
    satuan: "pH",
    fungsi: "Keasaman tanah — dasar dosis kapur/pupuk. Target umum 5.5–7.0 tergantung komoditas.",
    rekomendasi: "pH tanah RS485/Modbus, probe stainless, akurasi ±0.3 pH, tahan korosi",
    harga: "Rp 450.000",
    alternatif: "Probe analog + modul pH-4502C (±Rp 180rb) — perlu kalibrasi buffer sering, tidak untuk komersial.",
    keyword: "Sensor pH tanah RS485 Modbus",
    threshold: "min 5.5, max 7.5 — sesuaikan komoditas di panduan tanaman",
    tips: "Bilas probe tiap selesai ukur. Jangan tertukar dengan probe pH air (kaca, rapuh).",
    imageUrl: U("1530836369250-ef72a3f5cda8"),
  },
  {
    slug: "npk-3in1",
    nama: "Sensor NPK 3-in-1 RS485",
    tipeApps: ["NPK_N", "NPK_P", "NPK_K"],
    kategori: "Tanah",
    satuan: "mg/kg",
    fungsi: "Satu probe baca 3 unsur: Nitrogen (daun), Fosfor (akar/bunga), Kalium (buah) — dasar rekomendasi pupuk.",
    rekomendasi: "NPK 3-in-1 RS485/Modbus",
    harga: "Rp 550.000",
    keyword: "Sensor NPK RS485 Modbus 3in1",
    threshold: "Vegetatif butuh N tinggi; generatif butuh P-K. Lihat panduan per komoditas.",
    tips: "Hemat: 1 probe untuk 2–3 lahan — pindah manual, catat tiap titik di aplikasi.",
    imageUrl: U("1592982537447-7440770cbfc9"),
  },
  {
    slug: "soil-moisture",
    nama: "Sensor Kelembaban Tanah Kapasitif",
    tipeApps: ["SOIL_MOISTURE"],
    kategori: "Tanah",
    satuan: "%",
    fungsi: "Kadar air tanah → jadwal siram presisi, cegah busuk akar dan layu.",
    rekomendasi: "Capacitive soil moisture v1.2 (anti korosi)",
    harga: "Rp 25–35.000",
    alternatif: "Versi resistif bergigi — murah tapi cepat korosi, TIDAK rekomendasi.",
    keyword: "capacitive soil moisture sensor v1.2",
    threshold: "min 30, max 80 — siram saat di bawah 30%",
    tips: "Tanam probe sampai garis batas, jangan terendam penuh. Kalibrasi kering vs basah sekali.",
    imageUrl: U("1472214103451-9374bd1c798e"),
  },
  {
    slug: "tds-ec",
    nama: "Sensor TDS/EC RS485",
    tipeApps: ["TDS_PPM", "EC"],
    kategori: "Hidroponik",
    satuan: "ppm",
    fungsi: "Kepekatan nutrisi hidroponik (konversi EC → PPM otomatis). Wajib untuk hidroponik.",
    rekomendasi: "TDS/EC RS485/Modbus 0–2000 ppm",
    harga: "Rp 350.000",
    alternatif: "TDS analog murah (±Rp 45rb) — akurasi kurang, cukup untuk hobi rumahan.",
    keyword: "Sensor TDS EC RS485 Modbus",
    threshold: "800–1200 ppm vegetatif, 1200–1800 ppm generatif — sesuaikan komoditas",
    tips: "Bilas probe dengan air bersih tiap minggu agar tidak kerak nutrisi.",
    imageUrl:
      "https://images.pexels.com/photos/4199761/pexels-photo-4199761.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    slug: "ph-air",
    nama: "Sensor pH Air Hidroponik",
    tipeApps: ["PH"],
    kategori: "Hidroponik",
    satuan: "pH",
    fungsi: "pH larutan nutrisi — target hidroponik 5.5–6.5. Probe kaca, beda dengan probe tanah!",
    rekomendasi: "pH air RS485, probe kaca",
    harga: "Rp 380.000",
    keyword: "Sensor pH air RS485",
    threshold: "min 5.5, max 6.5",
    tips: "Simpan probe selalu basah (larutan KCl), jangan sampai kering — probe mati permanen.",
    imageUrl: U("1772726460714-1a2b186d6bb9"),
  },
  {
    slug: "ds18b20",
    nama: "Sensor Suhu Air Waterproof",
    tipeApps: ["TEMP"],
    kategori: "Hidroponik",
    satuan: "°C",
    fungsi: "Suhu larutan — kompensasi TDS + cegah akar busuk (air di atas 30°C bahaya).",
    rekomendasi: "DS18B20 waterproof, −55..125°C",
    harga: "Rp 25.000",
    keyword: "DS18B20 waterproof",
    threshold: "min 18, max 30",
    tips: "Celupkan dekat akar, jauhkan dari pompa panas. Satu bus bisa paralel banyak titik.",
    imageUrl: U("1625246333195-78d9c38ad449"),
  },
  {
    slug: "dht22",
    nama: "Sensor Suhu & Kelembaban Udara",
    tipeApps: ["TEMP", "HUMIDITY"],
    kategori: "Lingkungan",
    satuan: "°C / %",
    fungsi: "Iklim mikro kebun — suhu/kelembaban ekstrem picu stres tanaman & jamur.",
    rekomendasi: "DHT22 (±Rp 35rb, cukup) atau SHT30 (±Rp 60rb, lebih akurat)",
    harga: "Rp 35–60.000",
    keyword: "DHT22 AM2302",
    threshold: "suhu 20–33°C, humidity 50–90%",
    tips: "Pasang di tempat teduh berventilasi, jangan kena hujan/sinar langsung.",
    imageUrl: U("1585320806297-9794b3e4eeae"),
  },
  {
    slug: "esp32-node",
    nama: "Node ESP32 + Pendukung",
    tipeApps: ["—"],
    kategori: "Node",
    satuan: "—",
    fungsi: "Otak tiap kebun: baca semua sensor via WiFi/MQTT tiap 60 detik, kontrol relay valve.",
    rekomendasi: "ESP32 DevKit v1 30-pin + Box IP65 + Adaptor 12V 2A + LM2596 + MAX485 + Dupont",
    harga: "Rp 210.000/paket",
    keyword: "ESP32 DevKit v1 30pin",
    threshold: "Interval kirim 60 detik, QoS 1",
    tips: "Tanpa MAX485, sensor RS485 tidak bisa ngobrol dengan ESP32. Oles sealant di lubang kabel box.",
    imageUrl: U("1634452015397-ad0686a2ae2d"),
  },
];
