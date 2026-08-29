import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async create(kebunId: string, dto: CreateDeviceDto) {
    // Pastikan kebun ada
    const kebun = await this.prisma.kebun.findUnique({ where: { id: kebunId } });
    if (!kebun) throw new NotFoundException('Kebun tidak ditemukan');

    // Jika lahanId diberikan, pastikan lahan milik kebun yang sama
    if (dto.lahanId) {
      const lahan = await this.prisma.lahan.findFirst({
        where: { id: dto.lahanId, kebunId },
      });
      if (!lahan) throw new NotFoundException('Lahan tidak ditemukan di kebun ini');
    }

    try {
      return await this.prisma.device.create({
        data: {
          kebunId,
          nama: dto.nama,
          type: dto.type,
          lokasi: dto.lokasi,
          status: dto.status as any,
          mqttTopic: dto.mqttTopic,
          lahanId: dto.lahanId ?? null,
        },
        include: { sensors: true, lahan: true },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('mqttTopic sudah terdaftar');
      throw e;
    }
  }

  async findAll(kebunId: string) {
    const kebun = await this.prisma.kebun.findUnique({ where: { id: kebunId } });
    if (!kebun) throw new NotFoundException('Kebun tidak ditemukan');

    return this.prisma.device.findMany({
      where: { kebunId },
      include: { sensors: true, lahan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateDeviceDto) {
    const existing = await this.prisma.device.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Device tidak ditemukan');

    // Validasi lahanId jika diubah
    if (dto.lahanId !== undefined) {
      if (dto.lahanId === null || dto.lahanId === '') {
        // detach
      } else {
        const lahan = await this.prisma.lahan.findFirst({
          where: { id: dto.lahanId, kebunId: existing.kebunId },
        });
        if (!lahan) throw new NotFoundException('Lahan tidak ditemukan di kebun device ini');
      }
    }

    try {
      return await this.prisma.device.update({
        where: { id },
        data: {
          nama: dto.nama,
          type: dto.type as any,
          lokasi: dto.lokasi,
          status: dto.status as any,
          mqttTopic: dto.mqttTopic,
          lahanId: dto.lahanId === '' ? null : dto.lahanId,
        },
        include: { sensors: true },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('mqttTopic sudah terdaftar');
      throw e;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.device.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Device tidak ditemukan');

    await this.prisma.device.delete({ where: { id } });
    return { message: 'Device berhasil dihapus' };
  }
}
