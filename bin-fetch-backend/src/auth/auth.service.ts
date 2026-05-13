import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(email: string, pass: string, fullName: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Hash the password securely (10 salt rounds)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(pass, saltRounds);

    // 2. Insert into the custom_users table
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        email: email, 
        password: hashedPassword, 
        full_name: fullName 
      }])
      .select();

    if (error) {
      // If email already exists, Supabase throws an error which we catch here
      throw new BadRequestException(error.message);
    }

    return { message: 'User registered successfully!', user: data[0] };
  }

  async login(email: string, pass: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Find the user in the database
    const { data: user, error } = await supabase
      .from('custom_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new NotFoundException('User not found. Please register first.');
    }

    // 2. Compare the typed password with the hashed password in the database
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password.');
    }

    // 3. Return success data
    return { 
      message: 'Login successful!', 
      userId: user.id, 
      role: user.role,
      fullName: user.full_name
    };
  }
}