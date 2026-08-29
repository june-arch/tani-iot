import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller()
export class DevicesController {
  constructor(private devices: DevicesService) {}

  @Post('kebuns/:kebunId/devices')
  create(@Param('kebunId') kebunId: string, @Body() dto: CreateDeviceDto) {
    return this.devices.create(kebunId, dto);
  }

  @Get('kebuns/:kebunId/devices')
  findAll(@Param('kebunId') kebunId: string) {
    return this.devices.findAll(kebunId);
  }

  @Patch('devices/:id')
  update(@Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.devices.update(id, dto);
  }

  @Delete('devices/:id')
  remove(@Param('id') id: string) {
    return this.devices.remove(id);
  }
}
