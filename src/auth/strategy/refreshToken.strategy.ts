import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interface/auth.interface';
import { AuthService } from '../auth.service';
import type { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'refreshTokenStrategy',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secretKey = config.get<string>('JWT_REFRESH_TOKEN');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.['refreshToken'] || null,
      ]),
      ignoreExpiration: false,
      secretOrKey: secretKey!,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req?.cookies?.['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return { ...payload, refreshToken };
  }
}
