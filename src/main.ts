import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      // DTO에 정의 하지 않은 값은 전달받지 않음 에러 발생 X
      whitelist: true,
      // 정의 하지 않은 값을 전달하면 에러 발생 O
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
