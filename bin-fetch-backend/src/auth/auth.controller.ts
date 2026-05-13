import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    // Extracts the JSON sent from Next.js
    const { email, password, fullName } = body;
    return this.authService.register(email, password, fullName);
  }

  @Post('login')
  async login(@Body() body: any) {
    // Extracts the JSON sent from Next.js
    const { email, password } = body;
    return this.authService.login(email, password);
  }
}