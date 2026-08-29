import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class TriggerIrrigationDto {
  @IsString()
  @IsNotEmpty()
  kebunId!: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsString()
  @IsNotEmpty()
  lahanId!: string;

  @IsNumber()
  @Min(1)
  @Max(86400)
  durationSec!: number;

  @IsOptional()
  @IsEnum(['MANUAL', 'SCHEDULE', 'AUTO'] as any)
  source?: 'MANUAL' | 'SCHEDULE' | 'AUTO';
}

export class ScheduleIrrigationDto {
  @IsString()
  @IsNotEmpty()
  kebunId!: string;

  @IsString()
  @IsNotEmpty()
  lahanId!: string;

  @IsString()
  @IsNotEmpty()
  cron!: string; // contoh: '0 6 * * *' — tiap jam 6 pagi

  @IsNumber()
  @Min(1)
  @Max(86400)
  durationSec!: number;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
