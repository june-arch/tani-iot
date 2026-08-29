import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IrrigationService } from './irrigation.service';
import { TriggerIrrigationDto, ScheduleIrrigationDto } from './dto/trigger.dto';

@Controller('irrigation')
export class IrrigationController {
  constructor(private irrigation: IrrigationService) {}

  @Post('trigger')
  trigger(@Body() dto: TriggerIrrigationDto) {
    return this.irrigation.trigger(dto);
  }

  @Post('schedule')
  schedule(@Body() dto: ScheduleIrrigationDto) {
    return this.irrigation.schedule(dto);
  }

  @Get('logs')
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
