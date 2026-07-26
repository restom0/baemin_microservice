import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authService = {
    send: jest.fn(),
  };
  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(authService as any);
  });

  it('rejects login requests without credentials', async () => {
    await expect(
      controller.login({ email: '', password: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sends trimmed login credentials to the user service', async () => {
    authService.send.mockReturnValue(of('jwt-token'));

    await expect(
      controller.login({ email: ' user@example.com ', password: 'secret' }),
    ).resolves.toBe('jwt-token');

    expect(authService.send).toHaveBeenCalledWith('login-user', {
      email: 'user@example.com',
      password: 'secret',
    });
  });

  it('rejects incomplete registration payloads', async () => {
    expect(() => controller.register({} as any)).toThrow(BadRequestException);
  });
});
