import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DeviceType, DeviceStatus } from '@prisma/client';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  nama?: string;

  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType;

  @IsOptional()
  @IsString()
  lokasi?: string;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsString()
  mqttTopic?: string;

  @IsOptional()
  @IsString()
  lahanId?: string | null;
}
