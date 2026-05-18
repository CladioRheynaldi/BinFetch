import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, full_name: string, role: string = 'customer') {
    const supabase = this.supabaseService.getClient();
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: userData, error } = await supabase
      .from('users')
      .insert({ email, password: hashedPassword, full_name, role })
      .select('id, email, role')
      .single();

    if (error) {
      if (error.code === '23505') throw new BadRequestException('Email already exists');
      throw new BadRequestException('Registration failed');
    }

    // Database trigger will insert into customers or staff automatically.
    return { message: 'User registered successfully', userId: userData.id };
  }

  async login(email: string, password: string) {
    const supabase = this.supabaseService.getClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password, role')
      .eq('email', email)
      .single();

    if (error || !user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token, userId: user.id, role: user.role };
  }
}