import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { PrismaService } from '../../prisma/prisma.service';
import { MqttService } from '../mqtt/mqtt.service';
import { TriggerIrrigationDto, ScheduleIrrigationDto } from './dto/trigger.dto';

@Injectable()
export class IrrigationService {
  private readonly logger = new Logger(IrrigationService.name);

  constructor(
    private prisma: PrismaService,
    private mqttService: MqttService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  private async checkTandon(kebunId: string): Promise<{ kosong: boolean; value?: number }> {
    // Cari semua sensor WATER_LEVEL di kebun ini, ambil telemetri terbaru
    const sensors = await this.prisma.sensor.findMany({
      where: {
        type: 'WATER_LEVEL' as any,
        device: { kebunId },
      },
      include: {
        device: true,
      },
    });

    if (sensors.length === 0) {
      // Tidak ada sensor tandon — anggap tidak ada batasan
      return { kosong: false };
    }

    for (const sensor of sensors) {
      const latest = await this.prisma.telemetry.findFirst({
        where: { sensorId: sensor.id },
        orderBy: { recordedAt: 'desc' },
      });
      if (latest && latest.value < 20) {
        return { kosong: true, value: latest.value };
      }
    }
    return { kosong: false };
  }

  private async resolveDeviceId(dto: { kebunId: string; lahanId?: string; deviceId?: string }): Promise<string | null> {
    if (dto.deviceId) return dto.deviceId;
    // Cari device irigasi di kebun/lahan — prioritas IRRIGATION lalu TANDON lalu apapun
    const where: any = { kebunId: dto.kebunId };
    if (dto.lahanId) {
      // coba cari yang match lahan, jika tidak ada fallback ke kebun saja
      const byLahan = await this.prisma.device.findFirst({
        where: { kebunId: dto.kebunId, lahanId: dto.lahanId, type: 'IRRIGATION' as any },
      });
      if (byLahan) return byLahan.id;
    }
    const byKebunIrrigation = await this.prisma.device.findFirst({
      where: { kebunId: dto.kebunId, type: 'IRRIGATION' as any },
    });
    if (byKebunIrrigation) return byKebunIrrigation.id;
    const anyDevice = await this.prisma.device.findFirst({ where: { kebunId: dto.kebunId } });
    return anyDevice?.id ?? null;
  }

  async trigger(dto: TriggerIrrigationDto) {
    // Validasi kebun & lahan
    const kebun = await this.prisma.kebun.findUnique({ where: { id: dto.kebunId } });
    if (!kebun) throw new NotFoundException('Kebun tidak ditemukan');
    const lahan = await this.prisma.lahan.findFirst({ where: { id: dto.lahanId, kebunId: dto.kebunId } });
    if (!lahan) throw new NotFoundException('Lahan tidak ditemukan di kebun ini');

    // Cek tandon WATER_LEVEL < 20% → BATAL_TANDON_KOSONG
    const tandon = await this.checkTandon(dto.kebunId);
    if (tandon.kosong) {
      this.logger.warn(
        `Irigasi dibatalkan — tandon kosong (${tandon.value}% < 20%) kebun=${dto.kebunId} lahan=${dto.lahanId}`,
      );
      const log = await this.prisma.irrigationLog.create({
        data: {
          kebunId: dto.kebunId,
          lahanId: dto.lahanId,
          deviceId: dto.deviceId ?? null,
          durationSec: dto.durationSec,
          source: (dto.source as any) ?? 'MANUAL',
          status: 'BATAL_TANDON_KOSONG' as any,
        },
      });
      return { status: 'BATAL_TANDON_KOSONG', message: 'Tandon kosong (<20%), irigasi dibatalkan', log };
    }

    const targetDeviceId = await this.resolveDeviceId(dto);
    const topic = targetDeviceId
      ? `tani/${dto.kebunId}/${targetDeviceId}/solenoid/set`
      : `tani/${dto.kebunId}/unknown/solenoid/set`;

    // Publish OPEN
    this.mqttService.publish(topic, { action: 'OPEN', durationSec: dto.durationSec });
    this.logger.log(`Irigasi OPEN dikirim ke ${topic} durasi ${dto.durationSec}s`);

    const log = await this.prisma.irrigationLog.create({
      data: {
        kebunId: dto.kebunId,
        lahanId: dto.lahanId,
        deviceId: targetDeviceId,
        durationSec: dto.durationSec,
        source: (dto.source as any) ?? 'MANUAL',
        status: 'SUKSES' as any,
      },
    });

    // Auto-close setelah durationSec
    setTimeout(() => {
      this.mqttService.publish(topic, { action: 'CLOSE' });
      this.logger.log(`Irigasi CLOSE otomatis dikirim ke ${topic} setelah ${dto.durationSec}s`);
    }, dto.durationSec * 1000);

    return { status: 'SUKSES', message: 'Irigasi dimulai', topic, log };
  }

  async schedule(dto: ScheduleIrrigationDto) {
    const kebun = await this.prisma.kebun.findUnique({ where: { id: dto.kebunId } });
    if (!kebun) throw new NotFoundException('Kebun tidak ditemukan');
    const lahan = await this.prisma.lahan.findFirst({ where: { id: dto.lahanId, kebunId: dto.kebunId } });
    if (!lahan) throw new NotFoundException('Lahan tidak ditemukan di kebun ini');

    const jobName = `irrigation-${dto.kebunId}-${dto.lahanId}-${Date.now()}`;

    // Validasi cron dengan mencoba membuat CronJob
    let job: CronJob;
    try {
      job = new CronJob(dto.cron, async () => {
        this.logger.log(`Cron irigasi terpicu: kebun=${dto.kebunId} lahan=${dto.lahanId} cron=${dto.cron}`);
        try {
          await this.trigger({
            kebunId: dto.kebunId,
            lahanId: dto.lahanId,
            durationSec: dto.durationSec,
            source: 'SCHEDULE',
            deviceId: dto.deviceId,
          });
        } catch (err: any) {
          this.logger.error(`Gagal eksekusi irigasi terjadwal: ${err?.message ?? err}`);
        }
      });
    } catch (err: any) {
      throw new NotFoundException(`Format cron tidak valid: ${dto.cron} — ${err?.message ?? err}`);
    }

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
    this.logger.log(`Jadwal irigasi dibuat: ${jobName} cron=${dto.cron} durasi=${dto.durationSec}s`);

    return { jobName, cron: dto.cron, kebunId: dto.kebunId, lahanId: dto.lahanId, durationSec: dto.durationSec };
  }

  async logs(query: { kebunId?: string; lahanId?: string; page?: number; limit?: number }) {
    const where: any = {};
    if (query.kebunId) where.kebunId = query.kebunId;
    if (query.lahanId) where.lahanId = query.lahanId;
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.irrigationLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip }),
      this.prisma.irrigationLog.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  listSchedules() {
    const jobs = this.schedulerRegistry.getCronJobs();
    const list: any[] = [];
    jobs.forEach((job, name) => {
      if (name.startsWith('irrigation-')) {
        list.push({ name, running: (job as any).running ?? true });
      }
    });
    return list;
  }
}
