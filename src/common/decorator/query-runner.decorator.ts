import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const QueryRunner = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request || !request.queryRunner) {
      throw new InternalServerErrorException('query runner 객체가 없음');
    }

    return request.queryRunner;
  },
);
