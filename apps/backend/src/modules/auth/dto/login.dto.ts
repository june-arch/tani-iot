import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @IsString({ message: 'Password harus berupa teks' })
  @MinLength(1, { message: 'Password tidak boleh kosong' })
  password!: string;
}

export class RefreshDto {
  @IsString({ message: 'Refresh token harus berupa teks' })
  refreshToken!: string;
}
