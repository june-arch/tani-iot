import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CropCategoryDto {
  SAYUR = 'SAYUR',
  BUAH = 'BUAH',
}

export class PupukDto {
  @IsString({ message: 'Nama pupuk harus berupa teks' })
  @IsNotEmpty({ message: 'Nama pupuk tidak boleh kosong' })
  nama!: string;

  @IsString({ message: 'Takaran harus berupa teks' })
  @IsNotEmpty({ message: 'Takaran tidak boleh kosong' })
  takaran!: string;

  @IsInt({ message: 'Interval hari harus angka' })
  @Min(1, { message: 'Interval hari minimal 1 hari' })
  intervalHari!: number;

  @IsString({ message: 'Cara aplikasi harus berupa teks' })
  @IsNotEmpty({ message: 'Cara aplikasi tidak boleh kosong' })
  cara!: string;
}

export class SowingGuideDto {
  @IsOptional()
  @IsEnum(['BIJI', 'STEK', 'CANGKOK', 'OKULASI'], { message: 'Metode harus BIJI, STEK, CANGKOK, atau OKULASI' })
  metode?: string;

  @IsOptional()
  sumber?: any;

  @IsString({ message: 'Media tanam harus berupa teks' })
  @IsNotEmpty({ message: 'Media tanam tidak boleh kosong' })
  mediaTanam!: string;

  @IsInt({ message: 'Durasi hari harus angka' })
  @Min(0, { message: 'Durasi hari tidak boleh negatif' })
  durasiHari!: number;

  @IsString({ message: 'Suhu optimal harus berupa teks' })
  @IsNotEmpty({ message: 'Suhu optimal tidak boleh kosong' })
  suhuOptimal!: string;

  @IsString({ message: 'Kelembaban harus berupa teks' })
  @IsNotEmpty({ message: 'Kelembaban tidak boleh kosong' })
  kelembaban!: string;

  @IsArray({ message: 'Langkah harus berupa array' })
  @IsString({ each: true, message: 'Setiap langkah harus berupa teks' })
  langkah!: string[];

  @IsString({ message: 'Indikator siap tanam harus berupa teks' })
  @IsNotEmpty({ message: 'Indikator siap tanam tidak boleh kosong' })
  siapTanamIndikator!: string;
}

export class GrowingGuideDto {
  @IsEnum(['VEGETATIF', 'GENERATIF'], { message: 'Fase harus VEGETATIF atau GENERATIF' })
  fase!: 'VEGETATIF' | 'GENERATIF';

  @IsArray({ message: 'Pupuk harus berupa array' })
  @ValidateNested({ each: true })
  @Type(() => PupukDto)
  pupuk!: PupukDto[];

  @IsString({ message: 'Penyiraman harus berupa teks' })
  @IsNotEmpty({ message: 'Penyiraman tidak boleh kosong' })
  penyiraman!: string;

  @IsOptional()
  @IsArray({ message: 'Hama harus berupa array' })
  @IsString({ each: true, message: 'Setiap hama harus berupa teks' })
  hama?: string[];

  @IsString({ message: 'Panen hari range harus berupa teks' })
  @IsNotEmpty({ message: 'Panen hari range tidak boleh kosong' })
  panenHariRange!: string;
}

export class HydroponicGuideDto {
  @IsString({ message: 'Sistem hidroponik harus berupa teks' })
  @IsNotEmpty({ message: 'Sistem hidroponik tidak boleh kosong' })
  sistem!: string;

  @IsString({ message: 'PPM range harus berupa teks' })
  @IsNotEmpty({ message: 'PPM range tidak boleh kosong' })
  ppmRange!: string;

  @IsString({ message: 'pH range harus berupa teks' })
  @IsNotEmpty({ message: 'pH range tidak boleh kosong' })
  phRange!: string;

  @IsArray({ message: 'Nutrisi harus berupa array' })
  @IsString({ each: true, message: 'Setiap nutrisi harus berupa teks' })
  nutrisi!: string[];

  @IsInt({ message: 'Durasi hari harus angka' })
  @Min(1, { message: 'Durasi hari minimal 1' })
  durasiHari!: number;
}

export class CreateCropDto {
  @IsString({ message: 'Nama komoditas harus berupa teks' })
  @IsNotEmpty({ message: 'Nama komoditas tidak boleh kosong' })
  name!: string;

  @IsString({ message: 'Slug harus berupa teks' })
  @IsNotEmpty({ message: 'Slug tidak boleh kosong' })
  slug!: string;

  @IsEnum(CropCategoryDto, { message: 'Kategori harus SAYUR atau BUAH' })
  category!: CropCategoryDto;

  @IsOptional()
  @IsString({ message: 'Nama ilmiah harus berupa teks' })
  scientificName?: string;

  @IsOptional()
  @IsString({ message: 'Deskripsi harus berupa teks' })
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Image URL harus URL yang valid' })
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'Iklim optimal harus berupa teks' })
  iklimOptimal?: string;

  @IsOptional()
  @IsString({ message: 'Ketinggian optimal harus berupa teks' })
  ketinggianOptimal?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SowingGuideDto)
  sowingGuide?: SowingGuideDto; // backward compat: single, akan di-convert ke array di service/seed

  @IsOptional()
  @IsArray({ message: 'Sowing guides harus berupa array' })
  @ValidateNested({ each: true })
  @Type(() => SowingGuideDto)
  sowingGuides?: SowingGuideDto[];

  @IsOptional()
  @IsArray({ message: 'Growing guides harus berupa array' })
  @ValidateNested({ each: true })
  @Type(() => GrowingGuideDto)
  growingGuides?: GrowingGuideDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => HydroponicGuideDto)
  hydroponicGuide?: HydroponicGuideDto;
}

export class QueryCropDto {
  @IsOptional()
  @IsEnum(CropCategoryDto, { message: 'Kategori harus SAYUR atau BUAH' })
  category?: CropCategoryDto;

  @IsOptional()
  @IsString({ message: 'Pencarian harus berupa teks' })
  search?: string;
}
