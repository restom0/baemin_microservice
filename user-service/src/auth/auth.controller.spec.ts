import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController (integration)', () => {
  const authService = {
    login: jest.fn(),
    register: jest.fn(),
  };
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();
    controller = moduleRef.get(AuthController);
  });

  it('routes login-user to the service', async () => {
    authService.login.mockResolvedValue('jwt-token');

    await expect(controller.login('user@example.com', 'secret')).resolves.toBe(
      'jwt-token',
    );
    expect(authService.login).toHaveBeenCalledWith(
      'user@example.com',
      'secret',
    );
  });

  it('routes register-user to the service', async () => {
    authService.register.mockResolvedValue({ user_id: 1 });

    await expect(
      controller.register(
        'user@example.com',
        'User Example',
        'secret',
        '0900000000',
        'user',
      ),
    ).resolves.toEqual({ user_id: 1 });
    expect(authService.register).toHaveBeenCalledWith(
      'user@example.com',
      'User Example',
      'secret',
      '0900000000',
      'user',
    );
  });
});
