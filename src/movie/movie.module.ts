import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';
import { CommonModule } from 'src/common/common.module';
import { User } from 'src/user/entities/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 해당 모듈에서 사용할 엔티티 입력
      Movie,
      MovieDetail,
      Director,
      Genre,
      User,
      MovieUserLike,
    ]),
    CommonModule,
    // MulterModule.register({
    //   // 파일 저장할 위치
    //   storage: diskStorage({
    //     // 현재 프로젝트 위치
    //     // ../netflix/public/movie
    //     destination: join(process.cwd(), 'public', 'movie'),
    //     // filename: (req, file, cb) => {
    //     //   // const split = file.originalname.split('.');
    //     //   // let extension = 'mp4';
    //     //   // if (split.length > 1) {
    //     //   //   extension = split[split.length - 1];
    //     //   // }
    //     //   // cb(null, `${v4()}_${Date.now()}.${extension}`);
    //     // },
    //   }),
    // }),
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
