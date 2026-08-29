import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { SensorsController, TelemetryController } from './sensors.controller';

@Module({
  controllers: [SensorsController, TelemetryController],
  providers: [SensorsService],
  exports: [SensorsService],
})
export class SensorsModule {}
