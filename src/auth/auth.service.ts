import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from 'src/drizzle/drizzle.module';
import * as schema from '../drizzle/schema/schema';
import { JwtPayload, login } from './interface/auth.interface';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../drizzle/schema/schema';
import { registerDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: registerDto) {
    const [existingUser] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, data.email));
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(data.password);
    const [user] = await this.db
      .insert(schema.users)
      .values({
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
      })
      .returning();

    const { accessToken, refreshToken } = this.generateToken(user);
    const hashedRefreshToken = await this.hashRefreshToken(refreshToken);
    await this.db
      .insert(schema.tokens)
      .values({
        refresh_token: hashedRefreshToken,
        refresh_token_expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        user_id: user.id,
      })
      .returning();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...payload } = user;
    return {
      token: {
        accessToken,
        refreshToken,
      },
      user: payload,
    };
  }

  async login(data: login) {
    console.log('data is', data);
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, data.email));
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const verifyPassword = await this.comparePassword(
      data.password,
      user.password,
    );

    if (!verifyPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateToken(user);

    const hashedRefreshToken = await this.hashRefreshToken(refreshToken);

    await this.db
      .update(schema.tokens)
      .set({
        refresh_token: hashedRefreshToken,
        refresh_token_expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        is_revoked: false,
      })
      .where(eq(schema.tokens.user_id, user.id));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...payload } = user;
    return {
      token: {
        accessToken,
        refreshToken,
      },
      user: payload,
    };
  }

  async findById(id: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async refresh(userId: string, refreshToken: string) {
    const [token] = await this.db
      .select()
      .from(schema.tokens)
      .where(eq(schema.tokens.user_id, userId));

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await this.compareRefreshToken(
      refreshToken,
      token.refresh_token,
    );

    if (
      !isValid ||
      token.is_revoked ||
      token.refresh_token_expiry < new Date()
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const [user] = await this.db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    // Just issue a new access token, nothing else
    const accessToken = this.generateAccessToken(user);
    return { access_token: accessToken };
  }

  private async hashPassword(passsword: string): Promise<string> {
    const salt = parseInt(this.configService.get<string>('SALT')!);
    return await bcrypt.hash(passsword, salt);
  }

  private generateToken(user: User) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  private generateAccessToken(user: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN'),
      expiresIn: '15m',
    });
  }

  private generateRefreshToken(user: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN'),
      expiresIn: '7d',
    });
  }

  private hashRefreshToken(refreshToken: string): Promise<string> {
    const salt = parseInt(this.configService.get<string>('REFRESH_SALT')!);
    return bcrypt.hash(refreshToken, salt);
  }

  private comparePassword(
    passsword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(passsword, hashedPassword);
  }

  private compareRefreshToken(
    refreshToken: string,
    hashedRefreshToken: string,
  ): Promise<boolean> {
    return bcrypt.compare(refreshToken, hashedRefreshToken);
  }
}
