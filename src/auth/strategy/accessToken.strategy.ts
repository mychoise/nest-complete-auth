import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interface/auth.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'accessTokenStrategy',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secretKey = config.get<string>('JWT_ACCESS_TOKEN');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey!,
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid tokens');
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
