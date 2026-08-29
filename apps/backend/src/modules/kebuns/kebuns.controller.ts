import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { KebunsService } from './kebuns.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { KebunMemberGuard } from './guards/kebun-member.guard';
import { CreateKebunDto } from './dto/create-kebun.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateLahanDto } from './dto/create-lahan.dto';

@Controller('kebuns')
@UseGuards(JwtAuthGuard)
export class KebunsController {
  constructor(private readonly kebunsService: KebunsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateKebunDto) {
    const kebun = await this.kebunsService.create(req.user.id, dto);
    return { message: 'Kebun berhasil dibuat', data: kebun };
  }

  @Get('my')
  async findMy(@Req() req: any) {
    const kebuns = await this.kebunsService.findMy(req.user.id);
    return { message: 'Daftar kebun berhasil diambil', data: kebuns };
  }

  @Get(':id')
  @UseGuards(KebunMemberGuard)
  async findOne(@Param('id') id: string) {
    const kebun = await this.kebunsService.findOne(id);
    return { message: 'Detail kebun berhasil diambil', data: kebun };
  }

  @Post(':id/members')
  @UseGuards(KebunMemberGuard)
  async addMember(@Param('id') id: string, @Req() req: any, @Body() dto: AddMemberDto) {
    const member = await this.kebunsService.addMember(id, req.user.id, dto);
    return { message: 'Anggota berhasil ditambahkan', data: member };
  }

  // ===== Lahan (scoped kebun) =====

  @Post(':kebunId/lahans')
  @UseGuards(KebunMemberGuard)
  async createLahan(@Param('kebunId') kebunId: string, @Body() dto: CreateLahanDto) {
    const lahan = await this.kebunsService.createLahan(kebunId, dto);
    return { message: 'Lahan berhasil dibuat', data: lahan };
  }

  @Get(':kebunId/lahans')
  @UseGuards(KebunMemberGuard)
  async findLahans(@Param('kebunId') kebunId: string) {
    const lahans = await this.kebunsService.findLahans(kebunId);
    return { message: 'Daftar lahan berhasil diambil', data: lahans };
  }
}
