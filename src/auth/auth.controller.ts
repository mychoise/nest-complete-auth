import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerDto } from './dto/register.dto';
import type { Response } from 'express';
import { loginDto } from './dto/login.dto';
import { JwtAccessGuard } from './guard/access.guard';
import { User } from './decorator/user.decorator';
import { JwtRefrshGuard } from './guard/refresh.guard';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './decorator/roles.decorator';
import { LoginGuard } from 'src/throttler/guards/login.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() data: registerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authService.register(data);

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return {
      user,
      accessToken: token.accessToken,
    };
  }

  @Post('login')
  @UseGuards(LoginGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() data: loginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authService.login(data);

    res.cookie('refreshToken', token.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return {
      user,
      accessToken: token.accessToken,
    };
  }

  @Get()
  getHello() {
    return {
      msg: 'hi',
    };
  }

  @Get('protected')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('admin')
  protected(@User() user: any) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user,
    };
  }
  @Get('refresh')
  @UseGuards(JwtRefrshGuard)
  async refresh(@User() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return await this.authService.refresh(user.sub, user.refreshToken);
  }
}
