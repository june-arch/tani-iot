import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorConfigDto } from './dto/update-sensor-config.dto';
import { IngestTelemetryDto } from './dto/ingest-telemetry.dto';
import { TelemetryQueryDto } from './dto/telemetry-query.dto';

@Controller()
export class SensorsController {
  constructor(private sensors: SensorsService) {}

  @Post('devices/:deviceId/sensors')
  create(@Param('deviceId') deviceId: string, @Body() dto: CreateSensorDto) {
    return this.sensors.create(deviceId, dto);
  }

  @Patch('sensors/:id/config')
  updateConfig(@Param('id') id: string, @Body() dto: UpdateSensorConfigDto) {
    return this.sensors.updateConfig(id, dto);
  }

  @Get('sensors/:id/telemetry')
  getTelemetry(@Param('id') id: string, @Query() query: TelemetryQueryDto) {
    return this.sensors.getTelemetry(id, query);
  }
}

@Controller('telemetry')
export class TelemetryController {
  constructor(private sensors: SensorsService) {}

  @Post('ingest')
  ingest(@Body() dto: IngestTelemetryDto) {
    return this.sensors.ingest(dto);
  }
}
