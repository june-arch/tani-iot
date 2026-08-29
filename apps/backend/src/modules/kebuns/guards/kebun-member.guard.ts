import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class KebunMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user?.id) {
      throw new ForbiddenException('Anda belum login');
    }

    // Ambil kebunId dari params id (GET /kebuns/:id) atau kebunId (lahans scoped)
    const kebunId: string | undefined = req.params?.id ?? req.params?.kebunId;

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
    if (kebun.pemilikId === user.id) {
      return true;
    }

    // Cek membership
    const member = await this.prisma.kebunMember.findUnique({
      where: { kebunId_userId: { kebunId, userId: user.id } },
    });
    if (!member) {
      throw new ForbiddenException('Anda bukan anggota kebun ini');
    }
    // Simpan member role ke request untuk keperluan authorize lebih lanjut
    req.kebunMember = member;
    return true;
  }
}
