import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream } from 'fs';
import { existsSync, mkdirSync } from 'fs';
import type { Response, Request } from 'express';
import { ReleasesService } from './releases.service';
import { CreateReleaseDto, UpdateReleaseDto } from './dto/create-release.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

const APK_MIME = 'application/vnd.android.package-archive';
// Batas default 500MB (APK debug Expo bisa >200MB), bisa dioverride via MAX_APK_MB.
const BATAS_BYTE =
  Math.max(1, parseInt(process.env.MAX_APK_MB ?? '500', 10) || 500) *
  1024 *
  1024;

function pastikanDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function namaAman(nama: string) {
  return nama.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
}

type PenggunaJwt = {
  email?: string;
  nama?: string;
  userId?: string;
};

@Controller('releases')
export class ReleasesController {
  constructor(private readonly rilis: ReleasesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @UseInterceptors(
    FileInterceptor('apk', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = join(process.env.UPLOAD_DIR ?? 'uploads', 'apk');
          pastikanDir(dir);
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(
            null,
            `${Date.now()}-${namaAman(file.originalname.replace(ext, ''))}${ext}`,
          );
        },
      }),
      limits: { fileSize: BATAS_BYTE },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const mimeOk =
          file.mimetype === APK_MIME ||
          file.mimetype === 'application/octet-stream';
        if (ext === '.apk' && mimeOk) cb(null, true);
        else
          cb(
            new BadRequestException(
              'File harus APK (.apk, maksimal ' +
                Math.round(BATAS_BYTE / 1024 / 1024) +
                'MB)',
            ),
            false,
          );
      },
    }),
  )
  async unggah(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateReleaseDto,
    @Req() req: Request & { user?: PenggunaJwt },
  ) {
    if (!file) {
      throw new BadRequestException('File APK wajib diunggah (field: apk)');
    }
    const pengunggah =
      req.user?.email ?? req.user?.nama ?? req.user?.userId ?? undefined;
    return this.rilis.create(dto, file, pengunggah);
  }

  /** Daftar semua rilis (termasuk draft) — khusus SUPERADMIN. */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  async daftar() {
    return this.rilis.findAll();
  }

  /**
   * Rilis terbaru yang dipublikasikan — PUBLIK (tanpa JWT).
   * Dipakai mobile + halaman /unduh. Query opsional ?currentCode=1
   * untuk menghitung flag adaPembaruan.
   */
  @Get('latest')
  async terbaru(@Query('currentCode') currentCode?: string) {
    const kode = currentCode ? parseInt(currentCode, 10) : undefined;
    return this.rilis.findLatest(
      typeof kode === 'number' && !Number.isNaN(kode) ? kode : undefined,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  async detail(@Param('id') id: string) {
    return this.rilis.findOne(id);
  }

  /** Unduh file APK — PUBLIK agar halaman /unduh + mobile bisa akses. */
  @Get(':id/download')
  async unduh(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rilis = await this.rilis.ambilFile(id);
    const stream = createReadStream(rilis.filePath);
    res.set({
      'Content-Type': rilis.mimeType,
      'Content-Disposition': `attachment; filename="tani-iot-v${rilis.versionName}.apk"`,
      'Content-Length': String(rilis.fileSize),
    });
    return new StreamableFile(stream);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  async ubah(@Param('id') id: string, @Body() dto: UpdateReleaseDto) {
    return this.rilis.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  async hapus(@Param('id') id: string) {
    return this.rilis.remove(id);
  }
}
