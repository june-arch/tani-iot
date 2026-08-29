import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateKebunDto } from './dto/create-kebun.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateLahanDto } from './dto/create-lahan.dto';

@Injectable()
export class KebunsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateKebunDto) {
    const kebun = await this.prisma.kebun.create({
      data: {
        nama: dto.nama,
        lokasi: dto.lokasi,
        luas: dto.luas,
        deskripsi: dto.deskripsi,
        pemilikId: userId,
        members: {
          create: { userId, role: 'OWNER' as const },
        },
      },
      include: { members: true },
    });
    return kebun;
  }

  async findMy(userId: string) {
    // Kebun dimana user adalah pemilik ATAU member
    const kebuns = await this.prisma.kebun.findMany({
      where: {
        OR: [{ pemilikId: userId }, { members: { some: { userId } } }],
      },
      include: {
        members: { include: { user: { select: { id: true, email: true, nama: true } } } },
        lahans: true,
        _count: { select: { lahans: true, members: true, devices: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return kebuns;
  }

  async findOne(kebunId: string) {
    const kebun = await this.prisma.kebun.findUnique({
      where: { id: kebunId },
      include: {
        pemilik: { select: { id: true, email: true, nama: true } },
        members: { include: { user: { select: { id: true, email: true, nama: true } } } },
        lahans: true,
        _count: { select: { lahans: true, members: true, devices: true } },
      },
    });
    if (!kebun) throw new NotFoundException('Kebun tidak ditemukan');
    return kebun;
  }

  async addMember(kebunId: string, requesterId: string, dto: AddMemberDto) {
    const kebun = await this.prisma.kebun.findUnique({ where: { id: kebunId } });
    if (!kebun) throw new NotFoundException('Kebun tidak ditemukan');

    // Hanya OWNER/ADMIN kebun atau pemilik yang boleh invite
    const isPemilik = kebun.pemilikId === requesterId;
    if (!isPemilik) {
      const requesterMember = await this.prisma.kebunMember.findUnique({
        where: { kebunId_userId: { kebunId, userId: requesterId } },
      });
      if (!requesterMember || !['OWNER', 'ADMIN'].includes(requesterMember.role)) {
        throw new ForbiddenException('Hanya pemilik/admin kebun yang dapat menambah anggota');
      }
    }

    // Resolve target user
    let targetUserId = dto.userId;
    if (!targetUserId && dto.email) {
      const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (!user) throw new NotFoundException('User dengan email tersebut tidak ditemukan');
      targetUserId = user.id;
    }
    if (!targetUserId) {
      throw new NotFoundException('userId atau email wajib diisi');
    }

    // Cegah owner di-add lagi sebagai member duplikat (sudah ada via create)
    const existing = await this.prisma.kebunMember.findUnique({
      where: { kebunId_userId: { kebunId, userId: targetUserId } },
    });
    if (existing) {
      throw new ConflictException('User sudah menjadi anggota kebun ini');
    }

    const member = await this.prisma.kebunMember.create({
      data: { kebunId, userId: targetUserId, role: dto.role },
      include: { user: { select: { id: true, email: true, nama: true } } },
    });
    return member;
  }

  // ===== Lahan CRUD (scoped kebun) =====

  async createLahan(kebunId: string, dto: CreateLahanDto) {
    const kebun = await this.prisma.kebun.findUnique({ where: { id: kebunId } });
    if (!kebun) throw new NotFoundException('Kebun tidak ditemukan');
    const lahan = await this.prisma.lahan.create({
      data: {
        kebunId,
        nama: dto.nama,
        tipe: dto.tipe,
        luas: dto.luas,
        lokasi: dto.lokasi,
      },
    });
    return lahan;
  }

  async findLahans(kebunId: string) {
    const kebun = await this.prisma.kebun.findUnique({ where: { id: kebunId } });
    if (!kebun) throw new NotFoundException('Kebun tidak ditemukan');
    return this.prisma.lahan.findMany({
      where: { kebunId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
