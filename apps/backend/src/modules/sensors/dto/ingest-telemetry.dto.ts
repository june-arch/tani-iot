import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class IngestTelemetryDto {
  @IsString()
  @IsNotEmpty()
  sensorId!: string;

  @IsNumber()
  value!: number;

  @IsOptional()
  raw?: Record<string, any>;
}
