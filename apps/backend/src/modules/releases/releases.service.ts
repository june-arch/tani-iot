import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReleaseDto, UpdateReleaseDto } from './dto/create-release.dto';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

export type RilisPublik = {
  id: string;
  versionName: string;
  versionCode: number;
  changelog: string | null;
  fileSize: number;
  downloadCount: number;
  dibuatOleh: string | null;
  createdAt: Date;
  /** Path relatif terhadap base API (contoh: /releases/xxx/download). */
  downloadPath: string;
  /** True bila query ?currentCode= lebih kecil dari versi ini. */
  adaPembaruan?: boolean;
};

@Injectable()
export class ReleasesService {
  private readonly logger = new Logger(ReleasesService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateReleaseDto,
    file: Express.Multer.File,
    dibuatOleh?: string,
  ) {
    const bentrok = await this.prisma.appRelease.findUnique({
      where: { versionCode: dto.versionCode },
    });
    if (bentrok) {
      await this.hapusFile(file.path).catch(() => undefined);
      throw new ConflictException(
        `Kode versi ${dto.versionCode} sudah dipakai oleh v${bentrok.versionName} — naikkan kode versi`,
      );
    }

    const rilis = await this.prisma.appRelease.create({
      data: {
        versionName: dto.versionName,
        versionCode: dto.versionCode,
        changelog: dto.changelog?.trim() || null,
        fileName: file.originalname,
        filePath: file.path.replace(/\\/g, '/'),
        fileSize: file.size,
        mimeType: file.mimetype || 'application/vnd.android.package-archive',
        isPublished: dto.isPublished ?? true,
        dibuatOleh: dibuatOleh ?? null,
      },
    });

    return {
      message: `APK v${rilis.versionName} berhasil diunggah`,
      data: this.kePublik(rilis),
    };
  }

  async findAll() {
    const semua = await this.prisma.appRelease.findMany({
      orderBy: { versionCode: 'desc' },
    });
    return {
      message: `Ditemukan ${semua.length} rilis APK`,
      data: semua.map((r) => this.kePublik(r)),
    };
  }

  async findLatest(currentCode?: number) {
    const rilis = await this.prisma.appRelease.findFirst({
      where: { isPublished: true },
      orderBy: { versionCode: 'desc' },
    });
    if (!rilis) {
      throw new NotFoundException('Belum ada APK yang dipublikasikan');
    }
    const publik = this.kePublik(rilis);
    if (typeof currentCode === 'number' && Number.isFinite(currentCode)) {
      publik.adaPembaruan = rilis.versionCode > currentCode;
    }
    return { message: `Rilis terbaru v${rilis.versionName}`, data: publik };
  }

  async findOne(id: string) {
    const rilis = await this.prisma.appRelease.findUnique({ where: { id } });
    if (!rilis) throw new NotFoundException('Rilis APK tidak ditemukan');
    return {
      message: `Rilis v${rilis.versionName}`,
      data: this.kePublik(rilis),
    };
  }

  async update(id: string, dto: UpdateReleaseDto) {
    const ada = await this.prisma.appRelease.findUnique({ where: { id } });
    if (!ada) throw new NotFoundException('Rilis APK tidak ditemukan');
    const rilis = await this.prisma.appRelease.update({
      where: { id },
      data: {
        changelog:
          dto.changelog !== undefined
            ? dto.changelog?.trim() || null
            : undefined,
        isPublished: dto.isPublished,
      },
    });
    return {
      message: `Rilis v${rilis.versionName} berhasil diperbarui`,
      data: this.kePublik(rilis),
    };
  }

  async remove(id: string) {
    const rilis = await this.prisma.appRelease.findUnique({ where: { id } });
    if (!rilis) throw new NotFoundException('Rilis APK tidak ditemukan');
    await this.prisma.appRelease.delete({ where: { id } });
    await this.hapusFile(rilis.filePath).catch((e: unknown) =>
      this.logger.warn(`Gagal hapus file ${rilis.filePath}: ${pesanError(e)}`),
    );
    return { message: `Rilis v${rilis.versionName} berhasil dihapus` };
  }

  /** Dipakai endpoint unduhan: ambil path file + tambah hitungan unduh. */
  async ambilFile(id: string) {
    const rilis = await this.prisma.appRelease.findUnique({ where: { id } });
    if (!rilis) throw new NotFoundException('Rilis APK tidak ditemukan');
    if (!existsSync(rilis.filePath)) {
      throw new NotFoundException(
        'File APK tidak ada di server — hubungi admin',
      );
    }
    // Hitung unduhan tanpa blokir stream (best-effort).
    this.prisma.appRelease
      .update({ where: { id }, data: { downloadCount: { increment: 1 } } })
      .catch((e: unknown) =>
        this.logger.warn(`Gagal catat unduhan: ${pesanError(e)}`),
      );
    return rilis;
  }

  private kePublik(r: {
    id: string;
    versionName: string;
    versionCode: number;
    changelog: string | null;
    fileSize: number;
    downloadCount: number;
    dibuatOleh: string | null;
    createdAt: Date;
  }): RilisPublik {
    return {
      id: r.id,
      versionName: r.versionName,
      versionCode: r.versionCode,
      changelog: r.changelog,
      fileSize: r.fileSize,
      downloadCount: r.downloadCount,
      dibuatOleh: r.dibuatOleh,
      createdAt: r.createdAt,
      downloadPath: `/releases/${r.id}/download`,
    };
  }

  private async hapusFile(path: string) {
    if (existsSync(path)) await unlink(path);
  }
}

function pesanError(e: unknown): string {
  return e instanceof Error ? e.message : 'kesalahan tak dikenal';
}
