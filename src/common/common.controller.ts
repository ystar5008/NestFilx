import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MovieFilePipe } from 'src/movie/pipe/movie-file.pipe';

@Controller('common')
export class CommonController {
  @Post('video')
  @UseInterceptors(
    FileInterceptor('video', {
      limits: {
        fileSize: 20000000,
      },
      fileFilter(req, file, callback) {
        if (file.mimetype !== 'video/mp4') {
          return callback(new BadRequestException('비디오만 업로드'), false);
        }

        callback(null, true);
      },
    }),
  )
  createVideo(
    @UploadedFile(
      new MovieFilePipe({
        maxSize: 20,
        mimeType: 'video/mp4',
      }),
    )
    movie: Express.Multer.File,
  ) {
    return {
      fileName: movie.filename,
    };
  }
}
