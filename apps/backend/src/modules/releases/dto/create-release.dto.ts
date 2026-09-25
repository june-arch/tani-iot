import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReleaseDto {
  @IsString({ message: 'Nama versi wajib diisi (contoh: 1.1.0)' })
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'Nama versi harus format semver (contoh: 1.1.0)',
  })
  versionName!: string;

  @Type(() => Number)
  @IsInt({ message: 'Kode versi harus bilangan bulat' })
  @Min(1, { message: 'Kode versi minimal 1' })
  @Max(1000000, { message: 'Kode versi terlalu besar' })
  versionCode!: number;

  @IsOptional()
  @IsString({ message: 'Catatan perubahan harus teks' })
  @MaxLength(5000, { message: 'Catatan perubahan maksimal 5000 karakter' })
  changelog?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({ message: 'Status publikasi harus boolean' })
  isPublished?: boolean;
}

export class UpdateReleaseDto {
  @IsOptional()
  @IsString({ message: 'Catatan perubahan harus teks' })
  @MaxLength(5000, { message: 'Catatan perubahan maksimal 5000 karakter' })
  changelog?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({ message: 'Status publikasi harus boolean' })
  isPublished?: boolean;
}
