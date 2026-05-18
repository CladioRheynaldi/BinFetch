import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('full_name') full_name: string,
    @Body('role') role?: string,
  ) {
    return this.authService.register(email, password, full_name, role);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.login(email, password);
  }
}