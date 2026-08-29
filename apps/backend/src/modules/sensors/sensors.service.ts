import { Injectable, NotFoundException } from '@nestjs/common';
import { AlertType, SensorType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorConfigDto } from './dto/update-sensor-config.dto';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { TelemetryQueryDto } from './dto/telemetry-query.dto';

function mapSensorTypeToAlertType(sensorType: SensorType, isLow: boolean): AlertType {
  switch (sensorType) {
    case SensorType.WATER_LEVEL:
      return AlertType.WATER_LOW;
    case SensorType.PH:
      return AlertType.PH_OUT_OF_RANGE;
    case SensorType.NPK_N:
    case SensorType.NPK_P:
    case SensorType.NPK_K:
      return AlertType.NPK_LOW;
    case SensorType.EC:
    case SensorType.TDS_PPM:
      return isLow ? AlertType.PPM_LOW : AlertType.PPM_HIGH;
    case SensorType.TEMP:
    case SensorType.HUMIDITY:
    case SensorType.SOIL_MOISTURE:
      // Tidak ada AlertType khusus suhu/kelembaban -> pakai PH_OUT_OF_RANGE sebagai generic out-of-range
      return AlertType.PH_OUT_OF_RANGE;
    case SensorType.SOLENOID:
      return AlertType.DEVICE_OFFLINE;
    default:
      return AlertType.PH_OUT_OF_RANGE;
  }
}

@Injectable()
export class SensorsService {
  constructor(private prisma: PrismaService) {}

  async create(deviceId: string, dto: CreateSensorDto) {
    const device = await this.prisma.device.findUnique({ where: { id: deviceId } });
    if (!device) throw new NotFoundException('Device tidak ditemukan');

    return this.prisma.sensor.create({
      data: {
        deviceId,
        type: dto.type,
        unit: dto.unit,
        minThreshold: dto.minThreshold ?? null,
        maxThreshold: dto.maxThreshold ?? null,
        isEnabled: dto.isEnabled ?? true,
        config: dto.config ?? undefined,
      },
    });
  }

  async updateConfig(id: string, dto: UpdateSensorConfigDto) {
    const sensor = await this.prisma.sensor.findUnique({ where: { id } });
    if (!sensor) throw new NotFoundException('Sensor tidak ditemukan');

    return this.prisma.sensor.update({
      where: { id },
      data: {
        minThreshold: dto.minThreshold !== undefined ? dto.minThreshold : undefined,
        maxThreshold: dto.maxThreshold !== undefined ? dto.maxThreshold : undefined,
        isEnabled: dto.isEnabled,
        config: dto.config !== undefined ? (dto.config as any) : undefined,
      },
    });
  }

  async getTelemetry(sensorId: string, query: TelemetryQueryDto) {
    const sensor = await this.prisma.sensor.findUnique({ where: { id: sensorId } });
    if (!sensor) throw new NotFoundException('Sensor tidak ditemukan');

    const limit = query.limit ?? 50;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;

    const where: any = { sensorId };
    if (query.from || query.to) {
      where.recordedAt = {};
      if (query.from) where.recordedAt.gte = new Date(query.from);
      if (query.to) where.recordedAt.lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      this.prisma.telemetry.findMany({
        where,
        orderBy: { recordedAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.telemetry.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Simulasi MQTT ingest: simpan Telemetry, update Device.lastSeen,
   * cek threshold -> buat Alert jika value di luar range.
   */
  async ingest(dto: IngestTelemetryDto) {
    const sensor = await this.prisma.sensor.findUnique({
      where: { id: dto.sensorId },
      include: { device: true },
    });
    if (!sensor) throw new NotFoundException('Sensor tidak ditemukan');

    // 1) Simpan telemetry
    const telemetry = await this.prisma.telemetry.create({
      data: {
        sensorId: dto.sensorId,
        value: dto.value,
        raw: dto.raw ?? undefined,
      },
    });

    // 2) Update device lastSeen + status ONLINE
    await this.prisma.device.update({
      where: { id: sensor.deviceId },
      data: { lastSeen: new Date(), status: 'ONLINE' },
    });

    // 3) Threshold check -> buat Alert jika breach
    let alert: any = null;
    if (sensor.isEnabled) {
      const min = sensor.minThreshold;
      const max = sensor.maxThreshold;
      const breachLow = min !== null && min !== undefined && dto.value < min;
      const breachHigh = max !== null && max !== undefined && dto.value > max;

      if (breachLow || breachHigh) {
        const isLow = breachLow;
        const alertType = mapSensorTypeToAlertType(sensor.type, isLow);
        const thresholdVal = isLow ? min : max;
        const direction = isLow ? 'di bawah minimum' : 'di atas maksimum';

        alert = await this.prisma.alert.create({
          data: {
            kebunId: sensor.device.kebunId,
            sensorId: sensor.id,
            type: alertType,
            title: `Sensor ${sensor.type} ${direction}`,
            message: `Nilai ${dto.value} ${sensor.unit} ${direction} (threshold: ${thresholdVal} ${sensor.unit}) pada device ${sensor.device.nama}`,
          },
        });
      }
    }

    return { telemetry, alert };
  }
}
