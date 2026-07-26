import { AuthService } from './auth.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

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

  it('rejects invalid credentials', async () => {
    prismaService.users.findFirst.mockResolvedValue(null);

    await expect(service.login('missing@example.com', 'bad')).resolves.toBe(
      'Invalid email or password',
    );
  });

  it('stores new passwords as hashes', async () => {
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
});
