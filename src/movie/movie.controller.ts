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
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMoiveDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-balidation.pipe';

@Controller('movie')
// movie 컨트롤러에서 ClassSerializerInterceptor 사용
@UseInterceptors(ClassSerializerInterceptor)
// 컨트롤러에 파이프 적용 가능
// @UsePipes(new ValidationPipe())
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  getMovies(@Query('title', MovieTitleValidationPipe) title?: string) {
    // 컨트롤러에는 검증 로직만 구현
    return this.movieService.findAll(title);
  }

  // 라우터에 파이프 적용 가능
  // @UsePipes(new ValidationPipe())
  @Get(':id')
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
  postMovie(@Body() body: CreateMovieDto) {
    return this.movieService.create(body);
  }

  @Patch(':id')
  patchMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMoiveDto,
  ) {
    return this.movieService.update(id, body);
  }

  @Delete(':id')
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    // 일반적으로 삭제된 리소스의 id만 반환함
    return this.movieService.remove(id);
  }
}
