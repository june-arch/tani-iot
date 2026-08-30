import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorConfigDto } from './dto/update-sensor-config.dto';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { TelemetryQueryDto } from './dto/telemetry-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { KebunMemberGuard } from '../kebuns/guards/kebun-member.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class SensorsController {
  constructor(private sensors: SensorsService) {}

  @Post('devices/:deviceId/sensors')
  @UseGuards(KebunMemberGuard)
  create(@Param('deviceId') deviceId: string, @Body() dto: CreateSensorDto) {
    return this.sensors.create(deviceId, dto);
  }

  @Patch('sensors/:id/config')
  @UseGuards(KebunMemberGuard)
  updateConfig(@Param('id') id: string, @Body() dto: UpdateSensorConfigDto) {
    return this.sensors.updateConfig(id, dto);
  }

  @Get('sensors/:id/telemetry')
  @UseGuards(KebunMemberGuard)
  getTelemetry(@Param('id') id: string, @Query() query: TelemetryQueryDto) {
    return this.sensors.getTelemetry(id, query);
  }
}

@Controller('telemetry')
export class TelemetryController {
  constructor(private sensors: SensorsService) {}

  // Ingest dibiarkan tanpa JwtAuthGuard karena dipanggil perangkat IoT via MQTT/REST dengan API-key;
  // jika ingin proteksi JWT, tambahkan @UseGuards(JwtAuthGuard) di sini.
  // TODO(rate-limit): tambahkan ThrottlerGuard (mis. 60 req/menit per device) untuk cegah spam ingest.
  @Post('ingest')
  ingest(@Body() dto: IngestTelemetryDto) {
    return this.sensors.ingest(dto);
  }
}
