// 이메일과 비밀번호 로그인 전략

import { Inject, Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

// 가드 호출 후 LocalStrategy 실행
export class LocalAuthGuard extends AuthGuard('naver') {}

// 프로바이더
@Injectable()
// @UseGuards(AuthGuard('naver'))
// export class LocalStrategy extends PassportStrategy(Strategy,'naver') {
export class LocalStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly authServcie: AuthService) {
    super({
      // validate 함수의 username 파라미터의 이름을 변경
      usernameField: 'email',
    });
  }

  // localStrategy
  // validate : username , password
  // return Request에서 값 전달받음
  async validate(email: string, password: string) {
    const user = await this.authServcie.authenticate(email, password);
    // validate 함수에서 return 된 값은 Request 객체에 추가됨
    // req.user
    return user;
  }
}
