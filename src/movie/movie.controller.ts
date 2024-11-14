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
  postMovie(@Body() body: CreateMovieDto) {
    console.log(body);
    return this.movieService.create(body);
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
}
