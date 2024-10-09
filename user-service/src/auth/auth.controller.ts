import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('login-user')
  login(
    @Payload('email') email: string,
    @Payload('password') password: string,
  ) {
    return this.authService.login(email, password);
  }
  @MessagePattern('register-user')
  register(
    @Payload('email') email: string,
    @Payload('full_name') full_name: string,
    @Payload('password') password: string,
    @Payload('phone') phone: string,
    @Payload('username') username: string,
  ) {
    return this.authService.register(
      email,
      full_name,
      password,
      phone,
      username,
    );
  }
}
