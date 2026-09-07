import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PlantingsService } from './plantings.service';
import { CreatePlantingDto, UpdatePlantingDto } from './dto/create-planting.dto';

@Controller('plantings')
@UseGuards(JwtAuthGuard)
export class PlantingsController {
  constructor(private readonly plantingsService: PlantingsService) {}

  @Post()
  async create(@Body() dto: CreatePlantingDto, @Req() req: any) {
    const data = await this.plantingsService.create(dto, req.user.id);
    return { sukses: true, pesan: 'Rencana semai berhasil dicatat', data };
  }

  @Get()
  async findAll(@Query('kebunId') kebunId: string | undefined, @Req() req: any) {
    if (kebunId) {
      const data = await this.plantingsService.findByKebun(kebunId, req.user.id);
      return { sukses: true, pesan: `Ditemukan ${data.length} rencana`, data };
    }
    const data = await this.plantingsService.findAllForUser(req.user.id);
    return { sukses: true, pesan: `Ditemukan ${data.length} rencana`, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePlantingDto, @Req() req: any) {
    const data = await this.plantingsService.update(id, dto, req.user.id);
    return { sukses: true, pesan: 'Rencana diperbarui', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const data = await this.plantingsService.remove(id, req.user.id);
    return { sukses: true, pesan: 'Rencana dihapus', data };
  }
}
