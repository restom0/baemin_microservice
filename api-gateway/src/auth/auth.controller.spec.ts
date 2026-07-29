import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
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

  describe('login', () => {
    it('rejects a missing request body', async () => {
      await expect(controller.login(undefined as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
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

    it('maps an upstream login failure to a 500 error', async () => {
      authService.send.mockReturnValue(
        throwError(() => new Error('user service down')),
      );

      await expect(
        controller.login({ email: 'user@example.com', password: 'secret' }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('register', () => {
    it('rejects a missing request body', () => {
      expect(() => controller.register(undefined as any)).toThrow(
        BadRequestException,
      );
    });

    it('rejects incomplete registration payloads', () => {
      expect(() => controller.register({} as any)).toThrow(BadRequestException);
    });

    it('sends trimmed registration details to the user service', async () => {
      authService.send.mockReturnValue(of({ user_id: 5 }));

      await expect(
        controller.register({
          email: ' user@example.com ',
          full_name: ' User Example ',
          password: 'secret',
          phone: ' 0900000000 ',
          username: ' user ',
        }),
      ).resolves.toEqual({ user_id: 5 });

      expect(authService.send).toHaveBeenCalledWith('register-user', {
        email: 'user@example.com',
        full_name: 'User Example',
        password: 'secret',
        phone: '0900000000',
        username: 'user',
      });
    });

    it('maps an upstream registration failure to a 500 payload', async () => {
      authService.send.mockReturnValue(
        throwError(() => new Error('user service down')),
      );

      await expect(
        controller.register({
          email: 'user@example.com',
          full_name: 'User Example',
          password: 'secret',
          phone: '0900000000',
          username: 'user',
        }),
      ).resolves.toEqual({ status: 500, message: 'Internal server error' });
    });
  });
});
