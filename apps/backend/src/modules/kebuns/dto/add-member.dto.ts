import { IsString, IsEnum, IsOptional, IsEmail } from 'class-validator';
import { KebunRole } from '@prisma/client';

export class AddMemberDto {
  @IsOptional()
  @IsString({ message: 'userId harus berupa teks' })
  userId?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @IsEnum(KebunRole, { message: 'Role kebun tidak valid' })
  role!: KebunRole;
}
