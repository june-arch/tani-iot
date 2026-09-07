import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsInt, Min } from 'class-validator';
import { LahanType } from '@prisma/client';

export class CreatePlantingDto {
  @IsString()
  lahanId!: string;

  @IsString()
  cropId!: string; // bisa slug atau id, service akan resolve

  @IsEnum(LahanType)
  metode!: LahanType;

  @IsDateString()
  tanggalSemai!: string;

  @IsOptional()
  @IsDateString()
  tanggalTanam?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  jumlah?: number;

  @IsOptional()
  @IsString()
  catatan?: string;
}

export class UpdatePlantingDto {
  @IsOptional()
  @IsDateString()
  tanggalTanam?: string;

  @IsOptional()
  @IsDateString()
  tanggalPanen?: string;

  @IsOptional()
  @IsString()
  catatan?: string;

  @IsOptional()
  @IsString()
  status?: string; // AKTIF | PANEN | GAGAL | SELESAI

  @IsOptional()
  @IsString()
  fase?: string;
}
