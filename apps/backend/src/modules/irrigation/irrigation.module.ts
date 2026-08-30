import { Module } from '@nestjs/common';
import { IrrigationService } from './irrigation.service';
import { IrrigationController } from './irrigation.controller';
import { MqttModule } from '../mqtt/mqtt.module';
import { KebunMemberGuard } from '../kebuns/guards/kebun-member.guard';

@Module({
  imports: [MqttModule],
  controllers: [IrrigationController],
  providers: [IrrigationService, KebunMemberGuard],
  exports: [IrrigationService],
})
export class IrrigationModule {}
