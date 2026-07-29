import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';
import { AuthService } from './auth.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

// Mirror AuthService#hashPassword so hashed-login paths verify successfully.
async function makeHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${key.toString('hex')}`;
}

describe('AuthService', () => {
  const jwtService = {
    signAsync: jest.fn(),
  };
  const prismaService = {
    users: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(jwtService as any, prismaService as any);
  });

  describe('login', () => {
    it('rejects when no user matches the identity', async () => {
      prismaService.users.findFirst.mockResolvedValue(null);

      await expect(service.login('missing@example.com', 'bad')).resolves.toBe(
        'Invalid email or password',
      );
    });

    it('logs in legacy plaintext users for backward compatibility', async () => {
      prismaService.users.findFirst.mockResolvedValue({
        password: 'secret',
        user_id: 12,
      });
      jwtService.signAsync.mockResolvedValue('jwt-token');

      await expect(service.login('user@example.com', 'secret')).resolves.toBe(
        'jwt-token',
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { user_id: 12 },
        { expiresIn: '1d', secret: 'BI_MAT' },
      );
    });

    it('logs in users stored with a scrypt hash', async () => {
      prismaService.users.findFirst.mockResolvedValue({
        password: await makeHash('secret'),
        user_id: 20,
      });
      jwtService.signAsync.mockResolvedValue('hashed-token');

      await expect(service.login('user@example.com', 'secret')).resolves.toBe(
        'hashed-token',
      );
    });

    it('rejects a wrong password against a scrypt hash', async () => {
      prismaService.users.findFirst.mockResolvedValue({
        password: await makeHash('secret'),
        user_id: 20,
      });

      await expect(service.login('user@example.com', 'wrong')).resolves.toBe(
        'Invalid email or password',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rejects a scrypt hash whose key length does not match', async () => {
      prismaService.users.findFirst.mockResolvedValue({
        password: 'scrypt$abcdef$aa',
        user_id: 21,
      });

      await expect(service.login('user@example.com', 'secret')).resolves.toBe(
        'Invalid email or password',
      );
    });

    it('treats an empty salt as a plaintext comparison', async () => {
      prismaService.users.findFirst.mockResolvedValue({
        password: 'scrypt$$deadbeef',
        user_id: 22,
      });

      await expect(
        service.login('user@example.com', 'scrypt$$deadbeef'),
      ).resolves.not.toBe('Invalid email or password');
    });

    it('treats an empty stored key as a plaintext comparison', async () => {
      prismaService.users.findFirst.mockResolvedValue({
        password: 'scrypt$salthex$',
        user_id: 23,
      });

      await expect(service.login('user@example.com', 'nope')).resolves.toBe(
        'Invalid email or password',
      );
    });
  });

  describe('register', () => {
    it('hashes the password and creates a new user', async () => {
      prismaService.users.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      prismaService.users.create.mockImplementation(({ data }) =>
        Promise.resolve({ user_id: 1, ...data }),
      );

      const result = await service.register(
        'user@example.com',
        'User Example',
        'secret',
        '0900000000',
        'user',
      );

      expect(result.password).toMatch(/^scrypt\$/);
      expect(result.password).not.toBe('secret');
    });

    it('rejects a duplicate email', async () => {
      prismaService.users.findFirst
        .mockResolvedValueOnce({ user_id: 1 })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(
        service.register('dupe@example.com', 'N', 'p', '1', 'u'),
      ).resolves.toBe('Email already exists');
      expect(prismaService.users.create).not.toHaveBeenCalled();
    });

    it('rejects a duplicate phone', async () => {
      prismaService.users.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ user_id: 2 })
        .mockResolvedValueOnce(null);

      await expect(
        service.register('e@example.com', 'N', 'p', '0900000000', 'u'),
      ).resolves.toBe('Phone already exists');
    });

    it('rejects a duplicate username', async () => {
      prismaService.users.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ user_id: 3 });

      await expect(
        service.register('e@example.com', 'N', 'p', '1', 'taken'),
      ).resolves.toBe('Username already exists');
    });
  });
});
