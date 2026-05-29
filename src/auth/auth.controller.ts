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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
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
      user,
    };
  }
}
