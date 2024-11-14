import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // public 데코레이터이면 모든 로직 bypass
    // 가져올 데코레이터, 어떤 문맥에서.

    // 컨트롤러에 적용한 @Public('exam') 데코레이터의 인자를 받아옴
    const isPubilc = this.reflector.get(Public, context.getHandler());

    console.log(isPubilc);

    // 퍼블릭 데코레이터가 존재하면 가드 true로 반환
    if (isPubilc) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    if (!request.user || request.user.type !== 'access') {
      return false;
    }

    // true 일때만 guard 다음 컨텍스트로 넘어감
    return true;
  }
}
