import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    // class-validator 사용을 위해 글로벌 파이프(프로젝트 전체에)
    // ValidationPipe는 모든 Validation Annotaion이 적용되도록 해줌
    new ValidationPipe({
      // DTO에 정의 하지 않은 값은 전달받지 않음 에러 발생 X
      whitelist: true,
      // 정의 하지 않은 값을 전달하면 에러 발생 O
      forbidNonWhitelisted: true,
      transformOptions: {
        // Dto에 작성된 타입을 기반으로 타입을 변경해라
        // url에 입력된 파라미터들 take='2' => take=2로 변경
        // 자동으로 데이터 변환
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(3000);
}
bootstrap();
