import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

// service 처럼 주입하고 provider로 관리
@Injectable()
// 커스텀 파이프 작성시 PipeTransform 객체 구현
export class MovieTitleValidationPipe implements PipeTransform<string, string> {
  // transform함수를 구현
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      return value;
    }

    if (value.length <= 2) {
      throw new BadRequestException('제목은 3자이상');
    }
    return value;
  }
}
