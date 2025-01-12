import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request || !request.user || !request.user.sub) {
      throw new UnauthorizedException('사용자 찾을 수 없음');
    }

    // 요청 객체에서 userId추출
    return request.user.sub;
  },
);
