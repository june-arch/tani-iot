import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';

export enum RegisterRole {
  PETANI = 'PETANI',
  VIEWER = 'VIEWER',
}

export class RegisterDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(64, { message: 'Password maksimal 64 karakter' })
  password!: string;

  @IsString({ message: 'Nama harus berupa teks' })
  @MinLength(2, { message: 'Nama minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  nama!: string;

  @IsOptional()
  @IsEnum(RegisterRole, { message: 'Role tidak valid' })
  role?: RegisterRole;
}
