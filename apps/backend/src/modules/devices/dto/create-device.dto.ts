import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DeviceType, DeviceStatus } from '@prisma/client';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  nama!: string;

  @IsEnum(DeviceType)
  type!: DeviceType;

  @IsOptional()
  @IsString()
  lokasi?: string;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsString()
  @IsNotEmpty()
  mqttTopic!: string;

  @IsOptional()
  @IsString()
  lahanId?: string;
}
