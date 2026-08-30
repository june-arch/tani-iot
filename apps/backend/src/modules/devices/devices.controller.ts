import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { KebunMemberGuard } from '../kebuns/guards/kebun-member.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private devices: DevicesService) {}

  @Post('kebuns/:kebunId/devices')
  @UseGuards(KebunMemberGuard)
  create(@Param('kebunId') kebunId: string, @Body() dto: CreateDeviceDto) {
    return this.devices.create(kebunId, dto);
  }

  @Get('kebuns/:kebunId/devices')
  @UseGuards(KebunMemberGuard)
  findAll(@Param('kebunId') kebunId: string) {
    return this.devices.findAll(kebunId);
  }

  @Patch('devices/:id')
  @UseGuards(KebunMemberGuard)
  update(@Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.devices.update(id, dto);
  }

  @Delete('devices/:id')
  @UseGuards(KebunMemberGuard)
  remove(@Param('id') id: string) {
    return this.devices.remove(id);
  }
}
