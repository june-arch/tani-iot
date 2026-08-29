import { IsString, MinLength, MaxLength, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { LahanType } from '@prisma/client';

export class CreateLahanDto {
  @IsString({ message: 'Nama lahan harus berupa teks' })
  @MinLength(2, { message: 'Nama lahan minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama lahan maksimal 100 karakter' })
  nama!: string;

  @IsEnum(LahanType, { message: 'Tipe lahan tidak valid' })
  tipe!: LahanType;

  @IsNumber({}, { message: 'Luas harus berupa angka' })
  @Min(0.01, { message: 'Luas minimal 0.01' })
  luas!: number;

  @IsOptional()
  @IsString({ message: 'Lokasi harus berupa teks' })
  lokasi?: string;
}
