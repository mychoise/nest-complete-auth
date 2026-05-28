import { IsEmail, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class registerDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsIn(['admin', 'user'], { message: 'Role must be either admin or user' })
  role?: 'admin' | 'user';
}
