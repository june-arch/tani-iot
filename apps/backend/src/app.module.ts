import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { KebunsModule } from './modules/kebuns/kebuns.module';
import { DevicesModule } from './modules/devices/devices.module';
import { SensorsModule } from './modules/sensors/sensors.module';
import { CropsModule } from './modules/crops/crops.module';
import { AiModule } from './modules/ai/ai.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MqttModule } from './modules/mqtt/mqtt.module';
import { IrrigationModule } from './modules/irrigation/irrigation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    KebunsModule,
    DevicesModule,
    SensorsModule,
    CropsModule,
    AiModule,
    MqttModule,
    IrrigationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
