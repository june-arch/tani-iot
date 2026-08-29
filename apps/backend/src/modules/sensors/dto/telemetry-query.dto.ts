import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class TelemetryQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;
}
