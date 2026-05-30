import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/accessToken.strategy';
import { JwtAccessGuard } from './guard/access.guard';
import { JwtRefrshGuard } from './guard/refresh.guard';
import { JwtRefreshStrategy } from './strategy/refreshToken.strategy';
import { LoginGuard } from 'src/throttler/guards/login.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    DrizzleModule, // secrets are passed per-sign call
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAccessGuard,
    JwtRefrshGuard,
    LoginGuard,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
