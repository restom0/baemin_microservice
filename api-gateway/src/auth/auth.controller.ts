import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, of, retry, timeout } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(@Inject('USER_NAME') private authService: ClientProxy) {}

  @Post('/login')
  async login(@Body() user: { email: string; password: string }) {
    const { email, password } = user ?? {};
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    const result = await lastValueFrom(
      this.authService
        .send('login-user', {
          email: email.trim(),
          password,
        })
        .pipe(
          timeout(5000),
          catchError(() =>
            of({ status: 500, message: 'Internal server error' }),
          ),
        ),
    );
    if (result?.status === 500) {
      throw new InternalServerErrorException('Internal server error');
    }
    return result;
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
    const { email, full_name, password, phone, username } = user ?? {};
    if (!email || !full_name || !password || !phone || !username) {
      throw new BadRequestException('All fields are required');
    }
    return lastValueFrom(
      this.authService
        .send('register-user', {
          email: email.trim(),
          full_name: full_name.trim(),
          password,
          phone: phone.trim(),
          username: username.trim(),
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
