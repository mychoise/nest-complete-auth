import { IsEmail, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class loginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsNotEmpty({ message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsIn(['admin', 'user'], { message: 'Role must be either admin or user' })
  role?: 'admin' | 'user';
}
