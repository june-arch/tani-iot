import { Module } from '@nestjs/common';
import { KebunsService } from './kebuns.service';
import { KebunsController } from './kebuns.controller';
import { KebunMemberGuard } from './guards/kebun-member.guard';

@Module({
  controllers: [KebunsController],
  providers: [KebunsService, KebunMemberGuard],
  exports: [KebunsService],
})
export class KebunsModule {}
