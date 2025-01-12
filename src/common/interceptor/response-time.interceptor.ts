import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { delay, Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // 요청에 실행
    const req = context.switchToHttp().getRequest();

    const reqTime = Date.now();

    // 응답에 실행
    return (
      next
        .handle()
        // pipe함수는 동기적으로 아래 코드 실행
        .pipe(
          // 1초뒤에 실행
          tap(() => {
            const respTime = Date.now();
            const diff = respTime - reqTime;

            console.log(`[${req.method} ${req.path}] ${diff}ms`);
          }),
        )
    );
  }
}
