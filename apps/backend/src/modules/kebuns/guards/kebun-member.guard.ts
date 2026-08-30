import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class KebunMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const userId: string | undefined = user?.id ?? user?.userId ?? user?.sub;
    if (!userId) {
      throw new ForbiddenException('Anda belum login');
    }

    // Resolusi kebunId dari berbagai sumber: params.kebunId, body.kebunId, query.kebunId,
    // deviceId -> device.kebunId, sensorId (params.id) -> sensor.device.kebunId atau device.kebunId
    let kebunId: string | undefined = req.params?.kebunId;

    if (!kebunId) kebunId = req.body?.kebunId;
    if (!kebunId) kebunId = req.query?.kebunId;

    // deviceId scoped: POST /devices/:deviceId/sensors
    if (!kebunId && req.params?.deviceId) {
      const device = await this.prisma.device.findUnique({
        where: { id: req.params.deviceId },
        select: { kebunId: true },
      });
      if (device) kebunId = device.kebunId;
    }

    // sensor/device scoped by params.id: PATCH /devices/:id , PATCH /sensors/:id/config , GET /sensors/:id/telemetry
    // params.id bisa berupa kebunId (untuk /kebuns/:id) atau sensorId/deviceId — coba resolve berurutan
    if (!kebunId && req.params?.id) {
      // coba sebagai kebunId langsung
      const maybeKebun = await this.prisma.kebun.findUnique({
        where: { id: req.params.id },
        select: { id: true },
      });
      if (maybeKebun) {
        kebunId = req.params.id;
      } else {
        // coba sebagai sensorId
        const sensor = await this.prisma.sensor.findUnique({
          where: { id: req.params.id },
          select: { device: { select: { kebunId: true } } },
        });
        if (sensor?.device?.kebunId) {
          kebunId = sensor.device.kebunId;
        } else {
          // coba sebagai deviceId
          const device = await this.prisma.device.findUnique({
            where: { id: req.params.id },
            select: { kebunId: true },
          });
          if (device) kebunId = device.kebunId;
          else kebunId = req.params.id; // fallback biar error NotFound di bawah lebih deskriptif
        }
      }
    }

    if (!kebunId) {
      throw new ForbiddenException('Kebun ID tidak ditemukan di parameter');
    }

    const kebun = await this.prisma.kebun.findUnique({
      where: { id: kebunId },
      select: { id: true, pemilikId: true },
    });
    if (!kebun) {
      throw new NotFoundException('Kebun tidak ditemukan');
    }

    // Pemilik selalu punya akses
    if (kebun.pemilikId === userId) {
      return true;
    }

    // Cek membership
    const member = await this.prisma.kebunMember.findUnique({
      where: { kebunId_userId: { kebunId, userId } },
    });
    if (!member) {
      throw new ForbiddenException('Anda bukan anggota kebun ini');
    }
    // Simpan member role ke request untuk keperluan authorize lebih lanjut
    req.kebunMember = member;
    return true;
  }
}
