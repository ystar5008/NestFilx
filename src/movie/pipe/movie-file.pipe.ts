import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { rename } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class MovieFilePipe
  implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
  constructor(
    private readonly options: {
      maxSize: number;
      mimeType: string;
    },
  ) {}
  async transform(
    value: Express.Multer.File,
    metadata: ArgumentMetadata,
  ): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('movie 파일은 필수입니다.');
    }
    console.log(metadata);

    const byteSize = this.options.maxSize * 1000000;

    if (value.size > byteSize) {
      throw new BadRequestException(`${this.options.maxSize}MB 이하파일`);
    }

    if (value.mimetype !== this.options.mimeType) {
      throw new BadRequestException(`${this.options.mimeType}만 업로드`);
    }

    const split = value.originalname.split('.');

    let extension = 'mp4';

    if (split.length > 1) {
      extension = split[split.length - 1];
    }

    const filename = `${v4()}_${Date.now()}.${extension}`;
    const newPath = join(value.destination, filename);

    console.log(filename);
    await rename(value.path, newPath);

    return {
      ...value,
      filename,
      path: newPath,
    };
  }
}
