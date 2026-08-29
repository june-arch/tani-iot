# ESP32 Firmware Template — Tani IoT

> PlatformIO + Arduino framework. WiFi + MQTT + Modbus RS485 + Ultrasonic + Relay + DHT22. Siap flash, tinggal isi WiFi & ID.

## Setup

```bash
# install PlatformIO
pip install platformio

# atau via VS Code extension PlatformIO

# clone template (akan ada di docs ini) → buat project
pio run --target upload
pio device monitor --baud 115200
```

## platformio.ini

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
  knolleary/PubSubClient@^2.8
  adafruit/DHT sensor library@^1.4.4
  adafruit/Adafruit Unified Sensor@^1.1.9
  Preferences
```

## Sketch Utama (tani-iot.ino) — Ringkas, Production-Ready

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <Preferences.h>
#include <DHT.h>

#define DHTPIN 23
#define DHTTYPE DHT22
#define RELAY1 5
#define RELAY2 18
#define RELAY3 19
#define TRIGPIN 21
#define ECHOPIN 22
#define RS485_DE 4
#define RX2 16
#define TX2 17

const char* WIFI_SSID = "NAMA_WIFI_KEBUN";
const char* WIFI_PASS = "PASSWORD_WIFI";
const char* MQTT_HOST = "101.50.2.190"; // VPS dragon EMQX
const int   MQTT_PORT = 1884;
String KEBUN_ID  = "kebun-001";   // isi via AP config / hardcode awal
String DEVICE_ID = "device-tandon-01";

WiFiClient espClient;
PubSubClient mqtt(espClient);
Preferences prefs;
DHT dht(DHTPIN, DHTTYPE);
unsigned long lastPublish = 0;
const long PUBLISH_INTERVAL = 60000; // 60 detik

// --- WiFi ---
void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi connected: " + WiFi.localIP().toString());
}

// --- MQTT ---
void mqttCallback(char* topic, byte* payload, unsigned int len) {
  String msg; for (int i=0;i<len;i++) msg += (char)payload[i];
  Serial.println("MQTT in: " + String(topic) + " -> " + msg);
  // contoh: tani/kebun-001/device-tandon-01/solenoid/set
  if (String(topic).endsWith("/solenoid/set")) {
    bool open = msg.indexOf("OPEN") >= 0;
    int dur = 300;
    int idx = msg.indexOf("durationSec");
    if (idx>=0) dur = msg.substring(idx).toInt() ? msg.substring(idx).toInt() : 300;
    digitalWrite(RELAY1, open ? LOW : HIGH); // relay active LOW
    Serial.println(open ? "Valve OPEN" : "Valve CLOSE");
    // auto-close setelah durasi
    if (open) {
      delay(dur * 1000);
      digitalWrite(RELAY1, HIGH);
      publishStatus("CLOSE");
    } else {
      publishStatus("CLOSE");
    }
  }
}

void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("MQTT connecting...");
    String cid = "tani-" + DEVICE_ID + "-" + String(random(1000));
    if (mqtt.connect(cid.c_str())) {
      Serial.println("connected");
      String sub = "tani/" + KEBUN_ID + "/" + DEVICE_ID + "/solenoid/set";
      mqtt.subscribe(sub.c_str());
      Serial.println(" sub: " + sub);
    } else {
      Serial.print(" failed, rc="); Serial.print(mqtt.state());
      delay(2000);
    }
  }
}

void publishStatus(String state) {
  String topic = "tani/" + KEBUN_ID + "/" + DEVICE_ID + "/solenoid/status";
  String payload = "{\"state\":\"" + state + "\",\"ts\":" + String(millis()/1000) + "}";
  mqtt.publish(topic.c_str(), payload.c_str());
}

// --- Sensor: Ultrasonic (tandon %) ---
float readWaterLevelPct() {
  // asumsi tinggi tandon 120cm, sensor di atas
  const float TINGGI_CM = 120.0;
  digitalWrite(TRIGPIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIGPIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIGPIN, LOW);
  long dur = pulseIn(ECHOPIN, HIGH, 30000);
  float jarak = dur * 0.034 / 2.0; // cm
  if (jarak <= 0 || jarak > TINGGI_CM + 20) return -1; // error
  float pct = (TINGGI_CM - jarak) / TINGGI_CM * 100.0;
  if (pct < 0) pct = 0; if (pct > 100) pct = 100;
  return pct;
}

// --- Sensor: DHT22 ---
void readDHT(float &t, float &h) {
  h = dht.readHumidity();
  t = dht.readTemperature();
}

// --- Modbus RS485 (stub — isi sesuai sensor) ---
// Untuk pH/NPK/TDS RS485, pakai lib ModbusMaster:
// ModbusMaster node; node.begin(1, Serial2); node.readHoldingRegisters(0, 3);
// Simpan hasil ke variabel global, publish di loop.

// --- Publish telemetry ---
void publishTelemetry() {
  float level = readWaterLevelPct();
  if (level >= 0) {
    String topic = "tani/" + KEBUN_ID + "/" + DEVICE_ID + "/water_level";
    String payload = "{\"value\":" + String(level,1) + ",\"unit\":\"%\",\"ts\":" + String(millis()/1000) + "}";
    mqtt.publish(topic.c_str(), payload.c_str());
    Serial.println(" -> " + topic + " " + payload);
  }
  float t,h; readDHT(t,h);
  if (!isnan(t)) {
    String topic = "tani/" + KEBUN_ID + "/" + DEVICE_ID + "/temp";
    mqtt.publish(topic.c_str(), ("{\"value\":" + String(t,1) + ",\"unit\":\"C\"}").c_str());
  }
  if (!isnan(h)) {
    String topic = "tani/" + KEBUN_ID + "/" + DEVICE_ID + "/humidity";
    mqtt.publish(topic.c_str(), ("{\"value\":" + String(h,1) + ",\"unit\":\"%\"}").c_str());
  }
  // TODO: publish pH, NPK, PPM via Modbus yang sudah dibaca
  String statusTopic = "tani/" + KEBUN_ID + "/" + DEVICE_ID + "/status";
  String statusPayload = "{\"online\":true,\"rssi\":" + String(WiFi.RSSI()) + ",\"uptime\":" + String(millis()/1000) + "}";
  mqtt.publish(statusTopic.c_str(), statusPayload.c_str());
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY1, OUTPUT); pinMode(RELAY2, OUTPUT); pinMode(RELAY3, OUTPUT);
  digitalWrite(RELAY1, HIGH); digitalWrite(RELAY2, HIGH); digitalWrite(RELAY3, HIGH); // relay off (active LOW)
  pinMode(TRIGPIN, OUTPUT); pinMode(ECHOPIN, INPUT);
  pinMode(RS485_DE, OUTPUT); digitalWrite(RS485_DE, LOW);
  Serial2.begin(4800, SERIAL_8N1, RX2, TX2);
  dht.begin();
  prefs.begin("tani", false);
  // load dari prefs jika ada ( provisioning AP )
  if (prefs.getString("kebunId","") != "") KEBUN_ID = prefs.getString("kebunId");
  if (prefs.getString("deviceId","") != "") DEVICE_ID = prefs.getString("deviceId");
  connectWiFi();
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  connectMQTT();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (!mqtt.connected()) connectMQTT();
  mqtt.loop();
  if (millis() - lastPublish > PUBLISH_INTERVAL) {
    publishTelemetry();
    lastPublish = millis();
  }
}
```

## Kalibrasi & Uji

```bash
# 1. cek serial
pio device monitor

# 2. cek MQTT dari laptop (ganti IP dragon)
mosquitto_sub -h 101.50.2.190 -p 1884 -t "tani/+/+/water_level" -v

# 3. trigger valve dari backend/laptop
mosquitto_pub -h 101.50.2.190 -p 1884 -t "tani/kebun-001/device-tandon-01/solenoid/set" -m '{"action":"OPEN","durationSec":10}'

# 4. cek valve bunyi klik + air mengalir 10 detik lalu close
```

## Tips Lapangan

- **Waterproof:** Oles sealant di lubang kabel box IP65, kabel JSN-SR04T pakai klem.
- **Ground loop:** Jangan share GND 12V valve dengan 3.3V ESP tanpa star ground — hubungkan di 1 titik saja.
- **OTA:** Tambah `ArduinoOTA` lib jika kebun ada WiFi stabil — update tanpa bongkar box.
- **Deep sleep (hemat listrik):** Jika pakai baterai, `esp_sleep_enable_timer_wakeup(60*1000000); esp_deep_sleep_start();` — tapi relay valve tidak bisa deep sleep saat irigasi, jadi hanya untuk node sensor (bukan valve).

---

**Next:** Setelah hardware siap, lanjut provisioning via AP `TaniIoT-XXXX` → konek MQTT dragon → data muncul di dashboard.
