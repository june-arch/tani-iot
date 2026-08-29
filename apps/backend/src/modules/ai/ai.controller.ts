import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
  UseGuards,
  Optional,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function ensureUploadDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('diagnose')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = 'uploads/ai';
          ensureUploadDir(dir);
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase() || '.jpg';
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Format gambar harus jpg, png, atau webp (max 10MB)') as any, false);
      },
    }),
  )
  async diagnose(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Gambar wajib diunggah (field: image)');
    }

    const cropSlug = req.body?.cropSlug || undefined;
    const lahanId = req.body?.lahanId || undefined;
    const plantingId = req.body?.plantingId || undefined;
    const userId = req.user?.userId ?? req.user?.id ?? undefined;

    const imagePath = file.path.replace(/\\/g, '/'); // normalisasi Windows

    const result = await this.aiService.diagnose(
      imagePath,
      file.originalname,
      file.mimetype,
      cropSlug,
      lahanId,
      plantingId,
      userId,
    );

    return {
      sukses: true,
      pesan: 'Diagnosis berhasil',
      data: result,
    };
  }

  @Get('history')
  async history(
    @Query('lahanId') lahanId?: string,
    @Query('plantingId') plantingId?: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ) {
    // Jika ada user login, filter by user; jika tidak, tampilkan semua
    const userId = req?.user?.userId ?? req?.user?.id ?? undefined;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;

    const data = await this.aiService.getHistory({
      // jangan filter userId jika tidak ada auth — tampilkan semua
      // userId hanya dipakai jika endpoint diproteksi
      lahanId,
      plantingId,
      limit: parsedLimit,
    });

    return {
      sukses: true,
      pesan: `Ditemukan ${data.length} riwayat diagnosis`,
      data,
    };
  }

  @Post(':id/feedback')
  async feedback(
    @Param('id') id: string,
    @Body() body: { helpful: boolean; catatan?: string },
  ) {
    if (typeof body.helpful !== 'boolean') {
      throw new BadRequestException('Field helpful harus boolean');
    }

    const data = await this.aiService.giveFeedback(id, {
      helpful: body.helpful,
      catatan: body.catatan,
    });

    return {
      sukses: true,
      pesan: 'Feedback berhasil disimpan',
      data,
    };
  }
}
