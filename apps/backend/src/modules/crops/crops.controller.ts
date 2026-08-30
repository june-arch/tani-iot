import { Controller, Get, Param, Query } from '@nestjs/common';
import { CropsService } from './crops.service';
import { QueryCropDto } from './dto/create-crop.dto';

@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  // Public: daftar komoditas — tidak butuh login.
  // TODO(rate-limit): tambahkan ThrottlerGuard (mis. 30 req/menit per IP) untuk cegah abuse katalog publik.
  @Get()
  async findAll(@Query() query: QueryCropDto) {
    const data = await this.cropsService.findAll(query);
    return {
      sukses: true,
      pesan: `Ditemukan ${data.length} komoditas`,
      data,
    };
  }

  // Public: timeline budidaya per komoditas — tidak butuh login.
  // TODO(rate-limit): pertimbangkan ThrottlerGuard serupa untuk endpoint publik ini.
  @Get(':slug/timeline')
  async getTimeline(@Param('slug') slug: string) {
    const data = await this.cropsService.getTimeline(slug);
    return {
      sukses: true,
      pesan: `Timeline ${data.crop.name} berhasil diambil`,
      data,
    };
  }

  // Public: detail komoditas — tidak butuh login.
  // TODO(rate-limit): pertimbangkan ThrottlerGuard serupa untuk endpoint publik ini.
  // Jika butuh proteksi opsional: @UseGuards(OptionalJwtAuthGuard) untuk personalisasi tanpa wajib login.
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.cropsService.findBySlug(slug);
    return {
      sukses: true,
      pesan: `Komoditas ${data.name} ditemukan`,
      data,
    };
  }
}
