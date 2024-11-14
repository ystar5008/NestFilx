import {
  Controller,
  Post,
  Headers,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard, IAuthGuard, Type } from '@nestjs/passport';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';
import { User } from 'src/user/entities/user.entity';
import { Public } from './decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  registerUser(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Public()
  @Post('login')
  loginUser(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }

  // localStrategy 전용 로그인
  // AuthGuard => local.Strategy.ts
  // 가드 추상화
  // @UseGuards(LocalAuthGuard)가 실행될 때 LocalStrategy클래스 실행
  @UseGuards(LocalAuthGuard)
  @Post('login/passport')
  async loginUserPassPort(@Request() req) {
    return {
      refreshtoken: await this.authService.issueToken(req.user, true),
      accesstoken: await this.authService.issueToken(req.user, false),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() req) {
    return req.user;
  }

  @Post('token/access')
  async rotateAccessToken(@Request() req) {
    return { accessToken: await this.authService.issueToken(req.user, false) };
  }
}
