import { Module } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { SensorsController, TelemetryController } from './sensors.controller';
import { KebunMemberGuard } from '../kebuns/guards/kebun-member.guard';

@Module({
  controllers: [SensorsController, TelemetryController],
  providers: [SensorsService, KebunMemberGuard],
  exports: [SensorsService],
})
export class SensorsModule {}
