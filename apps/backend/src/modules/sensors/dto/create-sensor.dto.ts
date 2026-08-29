import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SensorType } from '@prisma/client';

export class CreateSensorDto {
  @IsEnum(SensorType)
  type!: SensorType;

  @IsString()
  unit!: string;

  @IsOptional()
  @IsNumber()
  minThreshold?: number;

  @IsOptional()
  @IsNumber()
  maxThreshold?: number;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  config?: Record<string, any>;
}
