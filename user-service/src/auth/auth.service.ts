import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const HASH_PREFIX = 'scrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async login(identity: string, password: string) {
    const user = await this.prismaService.users.findFirst({
      where: {
        OR: [{ email: identity }, { username: identity }, { phone: identity }],
      },
    });

    if (!user || !(await this.verifyPassword(password, user.password))) {
      return 'Invalid email or password';
    }

    return this.jwtService.signAsync(
      {
        user_id: user.user_id,
      },
      { expiresIn: '1d', secret: process.env.JWT_SECRET || 'BI_MAT' },
    );
  }
  async register(
    email: string,
    full_name: string,
    password: string,
    phone: string,
    username: string,
  ) {
    const checkEmail = await this.prismaService.users.findFirst({
      where: {
        email,
      },
    });
    const checkPhone = await this.prismaService.users.findFirst({
      where: {
        phone,
      },
    });
    const checkUsername = await this.prismaService.users.findFirst({
      where: {
        username,
      },
    });
    if (checkEmail) {
      return 'Email already exists';
    }
    if (checkPhone) {
      return 'Phone already exists';
    }
    if (checkUsername) {
      return 'Username already exists';
    }
    const newUser = {
      email,
      phone,
      username,
      full_name,
      password: await this.hashPassword(password),
    };
    const userRegister = await this.prismaService.users.create({
      data: newUser,
    });
    return userRegister;
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const key = (await scrypt(password, salt, 64)) as Buffer;
    return `${HASH_PREFIX}$${salt}$${key.toString('hex')}`;
  }

  private async verifyPassword(password: string, storedPassword: string) {
    const [prefix, salt, storedKey] = storedPassword.split('$');
    if (prefix !== HASH_PREFIX || !salt || !storedKey) {
      return password === storedPassword;
    }

    const key = (await scrypt(password, salt, 64)) as Buffer;
    const stored = Buffer.from(storedKey, 'hex');
    return stored.length === key.length && timingSafeEqual(stored, key);
  }
}
