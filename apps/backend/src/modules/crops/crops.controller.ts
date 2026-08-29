import { Controller, Get, Param, Query } from '@nestjs/common';
import { CropsService } from './crops.service';
import { QueryCropDto } from './dto/create-crop.dto';

@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Get()
  async findAll(@Query() query: QueryCropDto) {
    const data = await this.cropsService.findAll(query);
    return {
      sukses: true,
      pesan: `Ditemukan ${data.length} komoditas`,
      data,
    };
  }

  @Get(':slug/timeline')
  async getTimeline(@Param('slug') slug: string) {
    const data = await this.cropsService.getTimeline(slug);
    return {
      sukses: true,
      pesan: `Timeline ${data.crop.name} berhasil diambil`,
      data,
    };
  }

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
