import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateSensorConfigDto {
  @IsOptional()
  @IsNumber()
  minThreshold?: number | null;

  @IsOptional()
  @IsNumber()
  maxThreshold?: number | null;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  config?: Record<string, any> | null;
}
