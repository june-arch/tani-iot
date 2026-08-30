import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { KebunMemberGuard } from '../kebuns/guards/kebun-member.guard';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, KebunMemberGuard],
  exports: [DevicesService],
})
export class DevicesModule {}
