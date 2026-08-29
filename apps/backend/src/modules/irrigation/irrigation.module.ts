import { Module } from '@nestjs/common';
import { IrrigationService } from './irrigation.service';
import { IrrigationController } from './irrigation.controller';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [MqttModule],
  controllers: [IrrigationController],
  providers: [IrrigationService],
  exports: [IrrigationService],
})
export class IrrigationModule {}
