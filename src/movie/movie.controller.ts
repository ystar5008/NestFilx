import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
  Request,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMoiveDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-balidation.pipe';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { GetMoivesDto } from './dto/get-movies.dto';
import { CacheInterceptor } from 'src/common/interceptor/cache.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { MovieFilePipe } from './pipe/movie-file.pipe';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { number } from 'joi';

@Controller('movie')
// movie 컨트롤러에서 ClassSerializerInterceptor 사용
@UseInterceptors(ClassSerializerInterceptor)
// 컨트롤러에 파이프 적용 가능
// @UsePipes(new ValidationPipe())
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @Public()
  getMovies(@Query() dto: GetMoivesDto) {
    // 컨트롤러에는 검증 로직만 구현
    return this.movieService.findAll(dto);
  }

  // 라우터에 파이프 적용 가능
  // @UsePipes(new ValidationPipe())
  @Get(':id')
  @Public()
  getMovie(
    @Param(
      'id',
      new ParseIntPipe({
        // 에러메세지 변형
        exceptionFactory(error) {
          throw new BadRequestException('숫자를 입력해주세요');
        },
      }),
    )
    id: number,
  ) {
    return this.movieService.findOne(id);
  }

  @Post()
  // 관리자만 생성 가능
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  // 파일 업로드 받을 키값
  postMovie(
    @Body() body: CreateMovieDto,
    @QueryRunner() queryRunner: QR,
    @UserId() userId: number,
  ) {
    return this.movieService.create(body, userId, queryRunner);
  }

  @Patch(':id')
  @RBAC(Role.admin)
  patchMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMoiveDto,
  ) {
    return this.movieService.update(id, body);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    // 일반적으로 삭제된 리소스의 id만 반환함
    return this.movieService.remove(id);
  }

  /**
   * Like DisLike
   *
   * Like 버튼 누르면
   * Like 버튼 불 켜점
   *
   * Like 버튼 다시 누르면
   * Like 버튼 불 꺼짐
   *
   *
   */
  @Post(':id/like')
  createMovieLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, true);
  }

  @Post(':id/dislike')
  createMovieDisLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, false);
  }
}
