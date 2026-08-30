import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IrrigationService } from './irrigation.service';
import { TriggerIrrigationDto, ScheduleIrrigationDto } from './dto/trigger.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { KebunMemberGuard } from '../kebuns/guards/kebun-member.guard';

@Controller('irrigation')
@UseGuards(JwtAuthGuard)
export class IrrigationController {
  constructor(private irrigation: IrrigationService) {}

  @Post('trigger')
  @UseGuards(KebunMemberGuard)
  trigger(@Body() dto: TriggerIrrigationDto) {
    return this.irrigation.trigger(dto);
  }

  @Post('schedule')
  @UseGuards(KebunMemberGuard)
  schedule(@Body() dto: ScheduleIrrigationDto) {
    return this.irrigation.schedule(dto);
  }

  @Get('logs')
  @UseGuards(KebunMemberGuard)
  logs(
    @Query('kebunId') kebunId?: string,
    @Query('lahanId') lahanId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.irrigation.logs({
      kebunId,
      lahanId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('schedules')
  schedules() {
    return this.irrigation.listSchedules();
  }
}
