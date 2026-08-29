import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { SensorsModule } from '../sensors/sensors.module';

@Module({
  imports: [SensorsModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
