import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

interface LockoutEntry {
  count: number;
  lockedUntil: number | null;
}

@Injectable()
export class AuthService {
  // In-memory lockout store: 5x salah => lock 15 menit
  private readonly lockouts = new Map<string, LockoutEntry>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_MS = 15 * 60 * 1000;
  private readonly BCRYPT_ROUNDS: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.BCRYPT_ROUNDS = parseInt(this.config.get<string>('BCRYPT_ROUNDS') ?? '12', 10);
  }

  private checkLockout(email: string): void {
    const entry = this.lockouts.get(email);
    if (entry?.lockedUntil && Date.now() < entry.lockedUntil) {
      const sisa = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
      throw new ForbiddenException(
        `Akun terkunci karena 5 kali salah password. Coba lagi dalam ${sisa} menit.`,
      );
    }
    // Lock expired -> reset
    if (entry?.lockedUntil && Date.now() >= entry.lockedUntil) {
      this.lockouts.delete(email);
    }
  }

  private recordFailed(email: string): void {
    const entry = this.lockouts.get(email) ?? { count: 0, lockedUntil: null };
    entry.count += 1;
    if (entry.count >= this.MAX_ATTEMPTS) {
      entry.lockedUntil = Date.now() + this.LOCK_MS;
    }
    this.lockouts.set(email, entry);
  }

  private resetLockout(email: string): void {
    this.lockouts.delete(email);
  }

  private getRemainingAttempts(email: string): number {
    const entry = this.lockouts.get(email);
    if (!entry) return this.MAX_ATTEMPTS;
    return Math.max(0, this.MAX_ATTEMPTS - entry.count);
  }

  private signTokens(user: { id: string; email: string; role: string }) {
    const accessPayload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };
    const accessExpires = this.config.get<string>('JWT_EXPIRES_IN') ?? '15m';
    const refreshExpires = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const accessToken = (this.jwt as any).sign(accessPayload, { expiresIn: accessExpires });
    const refreshToken = (this.jwt as any).sign(refreshPayload, { expiresIn: refreshExpires });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }
    const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        nama: dto.nama,
        role: (dto.role as any) ?? 'PETANI',
      },
      select: { id: true, email: true, nama: true, role: true, createdAt: true },
    });
    const tokens = this.signTokens({ id: user.id, email: user.email, role: user.role });
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    this.checkLockout(dto.email);

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Akun Anda dinonaktifkan. Hubungi admin.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      this.recordFailed(dto.email);
      const locked = this.lockouts.get(dto.email)?.lockedUntil;
      if (locked && Date.now() < locked) {
        throw new ForbiddenException(
          'Akun terkunci karena 5 kali salah password. Coba lagi dalam 15 menit.',
        );
      }
      const sisa = this.getRemainingAttempts(dto.email);
      throw new UnauthorizedException(
        `Email atau password salah. Sisa percobaan: ${sisa} kali`,
      );
    }

    this.resetLockout(dto.email);
    const tokens = this.signTokens({ id: user.id, email: user.email, role: user.role });
    return {
      user: { id: user.id, email: user.email, nama: user.nama, role: user.role },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa');
    }
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token bukan refresh token');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User tidak ditemukan atau dinonaktifkan');
    }
    const tokens = this.signTokens({ id: user.id, email: user.email, role: user.role });
    return tokens;
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
