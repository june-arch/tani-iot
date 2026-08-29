import { IsString, MinLength, MaxLength, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateKebunDto {
  @IsString({ message: 'Nama kebun harus berupa teks' })
  @MinLength(2, { message: 'Nama kebun minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama kebun maksimal 100 karakter' })
  nama!: string;

  @IsString({ message: 'Lokasi harus berupa teks' })
  @MinLength(2, { message: 'Lokasi minimal 2 karakter' })
  lokasi!: string;

  @IsOptional()
  @IsNumber({}, { message: 'Luas harus berupa angka' })
  @Min(0, { message: 'Luas tidak boleh negatif' })
  luas?: number;

  @IsOptional()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  @MaxLength(1000, { message: 'Deskripsi maksimal 1000 karakter' })
  deskripsi?: string;
}
