import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';
@Module({
  imports: [
    MulterModule.register({
      // 파일 저장할 위치
      storage: diskStorage({
        // 현재 프로젝트 위치
        // ../netflix/public/movie
        destination: join(process.cwd(), 'public', 'temp'),
        filename: (req, file, cb) => {
          const split = file.originalname.split('.');
          let extension = 'mp4';
          if (split.length > 1) {
            extension = split[split.length - 1];
          }
          cb(null, `${v4()}_${Date.now()}.${extension}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
