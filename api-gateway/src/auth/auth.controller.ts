import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, of, retry, timeout } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(@Inject('USER_NAME') private authService: ClientProxy) {}

  @Post('/login')
  async login(@Body() user: { email: string; password: string }) {
    const { email, password } = user;
    if (!email || !password) {
      return {
        status: 400,
        message: 'Email and password are required',
      };
    }
    return await lastValueFrom(
      this.authService
        .send('login-user', {
          email,
          password,
        })
        .pipe(
          timeout(5000),
          catchError(() =>
            of({ status: 500, message: 'Internal server error' }),
          ),
        ),
    );
  }
  @Post('/register')
  register(
    @Body()
    user: {
      email: string;
      full_name: string;
      password: string;
      phone: string;
      username: string;
    },
  ) {
    const { email, full_name, password, phone, username } = user;
    if (!email || !full_name || !password || !phone || !username) {
      return {
        status: 400,
        message: 'All fields are required',
      };
    }
    return lastValueFrom(
      this.authService
        .send('register-user', {
          email,
          full_name,
          password,
          phone,
          username,
        })
        .pipe(
          timeout(5000),
          retry(3),
          catchError(() =>
            of({ status: 500, message: 'Internal server error' }),
          ),
        ),
    );
  }
}
