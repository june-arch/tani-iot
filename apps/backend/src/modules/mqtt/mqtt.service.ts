import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SensorsService } from '../sensors/sensors.service';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient | null = null;
  private isConnected = false;

  constructor(
    private prisma: PrismaService,
    private sensorsService: SensorsService,
  ) {}

  async onModuleInit() {
    const mqttUrl = process.env.MQTT_URL || 'mqtt://localhost:1883';
    const username = process.env.MQTT_USERNAME || undefined;
    const password = process.env.MQTT_PASSWORD || undefined;

    const options: any = {
      clientId: `tani-iot-${Math.random().toString(16).slice(2, 8)}`,
      reconnectPeriod: 5000,
      connectTimeout: 5000,
      keepalive: 30,
    };
    if (username) options.username = username;
    if (password) options.password = password;

    try {
      this.client = mqtt.connect(mqttUrl, options);

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log(`Terhubung ke broker MQTT: ${mqttUrl}`);
        this.client!.subscribe('tani/+/+/+', { qos: 1 }, (err) => {
          if (err) {
            this.logger.error(`Gagal subscribe topic tani/+/+/+ : ${err.message}`);
          } else {
            this.logger.log('Berhasil subscribe topic tani/+/+/+');
          }
        });
      });

      this.client.on('reconnect', () => {
        this.logger.warn('Mencoba menghubungkan kembali ke broker MQTT...');
      });

      this.client.on('offline', () => {
        this.isConnected = false;
        this.logger.warn('Broker MQTT offline — mode REST tetap aktif sebagai fallback');
      });

      this.client.on('close', () => {
        this.isConnected = false;
        this.logger.warn('Koneksi MQTT terputus');
      });

      this.client.on('error', (err: Error) => {
        this.logger.error(`Error koneksi MQTT: ${err.message}. Fallback ke REST tetap jalan.`);
        // Jangan throw — biarkan REST ingestion tetap berfungsi
      });

      this.client.on('message', (topic, payload) => {
        void this.handleMessage(topic, payload);
      });
    } catch (err: any) {
      this.logger.error(
        `Gagal inisialisasi MQTT: ${err?.message ?? err}. Fallback ke REST tetap jalan.`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.end(true);
      this.logger.log('Koneksi MQTT ditutup');
    }
  }

  /**
   * Publish payload ke topic MQTT. Jika broker tidak terhubung, hanya log warning (tidak throw).
   */
  publish(topic: string, payload: string | Record<string, any>): boolean {
    if (!this.client || !this.isConnected) {
      this.logger.warn(`MQTT belum terhubung — publish ke ${topic} ditunda/dilewati`);
      return false;
    }
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.client.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        this.logger.error(`Gagal publish ke ${topic}: ${err.message}`);
      } else {
        this.logger.log(`Publish ke ${topic}: ${message}`);
      }
    });
    return true;
  }

  private async handleMessage(topic: string, rawPayload: Buffer) {
    const parts = topic.split('/');
    // Validasi format tani/{kebunId}/{deviceId}/{sensorKey}
    if (parts.length !== 4 || parts[0] !== 'tani') {
      this.logger.warn(`Format topic tidak valid: ${topic} — diharapkan tani/+/+/+`);
      return;
    }
    const [, kebunId, deviceId, sensorKey] = parts;

    let data: any;
    try {
      data = JSON.parse(rawPayload.toString());
    } catch {
      this.logger.error(`Payload bukan JSON valid di topic ${topic}: ${rawPayload.toString().slice(0, 200)}`);
      return;
    }

    // Validasi payload: { value, unit?, ts? }
    if (data.value === undefined || data.value === null) {
      this.logger.error(`Payload tidak memiliki field 'value' di topic ${topic}`);
      return;
    }
    const value = Number(data.value);
    if (Number.isNaN(value)) {
      this.logger.error(`Field 'value' bukan angka valid di topic ${topic}: ${data.value}`);
      return;
    }
    const unit: string | undefined = data.unit ? String(data.unit) : undefined;
    const ts: string | undefined = data.ts ? String(data.ts) : undefined;

    try {
      // Cari device — cek by id, fallback by kebunId+cek keberadaan
      let device = await this.prisma.device.findUnique({ where: { id: deviceId } });
      if (!device) {
        // Fallback: cari device dengan kebunId & id fuzzy (untuk fleksibilitas testing)
        this.logger.warn(`Device tidak ditemukan: ${deviceId} (kebun: ${kebunId}) di topic ${topic}`);
        return;
      }
      if (device.kebunId !== kebunId) {
        this.logger.warn(
          `KebunId di topic (${kebunId}) tidak cocok dengan device.kebunId (${device.kebunId}) — tetap diproses`,
        );
      }

      // Cari sensor: prioritas by id == sensorKey, fallback by type == sensorKey.toUpperCase()
      let sensor: any = null;
      // Coba sebagai sensorId langsung
      sensor = await this.prisma.sensor.findFirst({
        where: { id: sensorKey, deviceId: device.id },
      });
      if (!sensor) {
        // Coba sebagai SensorType (case-insensitive)
        const typeKey = sensorKey.toUpperCase();
        sensor = await this.prisma.sensor.findFirst({
          where: { deviceId: device.id, type: typeKey as any },
        });
      }
      if (!sensor) {
        // Fallback global: cari sensor dengan type di kebun (untuk sensorKey berupa type)
        const typeKey = sensorKey.toUpperCase();
        const candidates = await this.prisma.sensor.findMany({
          where: { device: { kebunId: device.kebunId }, type: typeKey as any },
          take: 1,
        });
        if (candidates.length > 0) sensor = candidates[0];
      }

      if (!sensor) {
        this.logger.error(
          `Sensor tidak ditemukan untuk device ${deviceId} dengan key '${sensorKey}' di topic ${topic}`,
        );
        return;
      }

      // Panggil ingest — raw simpan unit/ts/topic asli
      const raw: Record<string, any> = { topic, kebunId, deviceId, sensorKey };
      if (unit) raw.unit = unit;
      if (ts) raw.ts = ts;
      if (data.raw && typeof data.raw === 'object') Object.assign(raw, data.raw);

      await this.sensorsService.ingest({
        sensorId: sensor.id,
        value,
        raw,
      });
      this.logger.log(
        `Telemetri tersimpan: sensor=${sensor.id} (${sensor.type}) value=${value} topic=${topic}`,
      );
    } catch (err: any) {
      this.logger.error(
        `Gagal menyimpan telemetri dari topic ${topic}: ${err?.message ?? err}`,
      );
    }
  }
}
