import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMoiveDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, QueryRunner, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';
import { GetMoivesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { join } from 'path';
import { rename } from 'fs/promises';
import { User } from 'src/user/entities/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';
@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  async findAll(dto: GetMoivesDto) {
    const { title } = dto;
    // movie 테이블 별칭
    const qb = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      console.log(title);
      qb.where('movie.title LIKE :title', { title: `%${title}` });
    }

    // if (take && page) {
    //   // 1페이지 에 5개의 데이터 가져오기
    //   // 0 - 1 * 5
    //   // 1 - 1 * 5
    //   this.commonService.applyPagePaginationParamsToQb(qb, dto);
    // }

    const { nextCursor } =
      await this.commonService.applycursorPaginationParamsToQb(qb, dto);
    // 실제 쿼리를 수행하는 부분

    const [data, count] = await qb.getManyAndCount();
    return { data, nextCursor, count };
  }

  async findOne(id: number) {
    const movie = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('moive.creator', 'creator')
      .where('movie.id = :id', { id })
      .getOne();
    // const movie = await this.movieRepository.findOne({
    //   where: {
    //     id,
    //   },
    //   relations: ['detail', 'director'],
    // });

    console.log(movie);
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID');
    }

    return movie;
  }

  async create(
    createMovieDto: CreateMovieDto,
    userId: number,
    qr: QueryRunner,
  ) {
    // 트랜잭션 격리수준
    // await qr.startTransaction('READ COMMITTED')
    // await qr.startTransaction('READ UNCOMMITTED')
    // await qr.startTransaction('REPEATABLE READ')
    // await qr.startTransaction('SERIALIZABLE')

    const { title, detail, directorId, genreIds, movieFileName } =
      createMovieDto;

    const director = await qr.manager.findOne(Director, {
      where: {
        id: directorId,
      },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID 감독');
    }

    const genres = await qr.manager.find(Genre, {
      where: {
        id: In(genreIds),
      },
    });

    if (genres.length !== genreIds.length) {
      throw new NotFoundException(
        `존재하지 않는 장르 => ${genres.map((genre) => genre.id).join(',')}`,
      );
    }

    const movieDetail = await qr.manager
      .createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({
        detail,
      })
      .execute();

    // insert한 값의 id를 가져오기 배열
    const movieDetailId = movieDetail.identifiers[0].id;

    const tempFolder = join('public', 'temp');
    const movieFolder = join('public', 'movie');

    const movie = await qr.manager
      .createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title,
        detail: {
          id: movieDetailId,
        },
        director,
        //파일 경로 DB에 입력
        creator: {
          id: userId,
        },
        movieFilePath: join(movieFolder, movieFileName),
      })
      .execute();

    const movieId = movie.identifiers[0].id;

    await qr.manager
      .createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map((genres) => genres.id));

    await rename(
      // 파일 위치변경
      // 기존 파일 위치와 파일이름
      join(process.cwd(), tempFolder, movieFileName),
      // 변경할 파일 위치와 파일이름
      join(process.cwd(), movieFolder, movieFileName),
    );

    return await qr.manager.findOne(Movie, {
      where: {
        id: movieId,
      },
      relations: ['detail', 'director', 'genres'],
    });
  }

  async update(id: number, updateMoiveDto: UpdateMoiveDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: {
          id,
        },
        relations: ['detail', 'genres'],
      });

      if (!movie) {
        throw new NotFoundException('존재하지 않는 ID');
      }
      const { directorId, detail, genreIds, ...movieRest } = updateMoiveDto;

      let newDirector;

      if (directorId) {
        const director = await qr.manager.findOne(Director, {
          where: {
            id: directorId,
          },
        });

        if (!director) {
          throw new NotFoundException('존재하지 않는 ID 감독');
        }

        newDirector = director;
      }

      let newGenres;
      if (genreIds) {
        const genres = await this.genreRepository.find({
          where: {
            id: In(genreIds),
          },
        });
        if (genres.length !== genreIds.length) {
          throw new NotFoundException(
            `존재하지 않는 장르 => ${genres.map((genre) => genre.id).join(',')}`,
          );
        }

        newGenres = genres;
      }

      const moiveUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector }),
      };

      await qr.manager
        .createQueryBuilder()
        // Movie 테이블 업데이트
        .update(Movie)
        .set(moiveUpdateFields)
        .where('id = :id', { id })
        .execute();

      //await this.movieRepository.update({ id }, moiveUpdateFields);

      if (detail) {
        await qr.manager
          .createQueryBuilder()
          .update(MovieDetail)
          .set({ detail })
          .where('id =:id', { id: movie.detail.id })
          .execute();
      }

      if (newGenres) {
        await this.movieRepository
          .createQueryBuilder()
          .relation(Movie, 'genres')
          .of(id)
          .addAndRemove(
            // 추가
            newGenres.map((genre) => genre.id),
            // 기존에 존재하는 장르 ID들 삭제
            movie.genres.map((genre) => genre.id),
          );
      }

      // const newMovie = await this.movieRepository.findOne({
      //   where: {
      //     id,
      //   },
      //   relations: ['detail', 'director'],
      // });

      // newMovie.genres = newGenres;

      // await this.movieDetailRepository.save(newMovie);

      await qr.commitTransaction();

      // 트랜잭션 커밋되면 qr.manager 사용 안해도됨
      return this.movieRepository.findOne({
        where: {
          id,
        },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async remove(id: number) {
    const movie: Movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID');
    }

    await this.movieRepository
      .createQueryBuilder()
      .delete()
      .where('id =: id', { id })
      .execute();
    //  await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(movie.detail.id);
    return id;
  }

  async toggleMovieLike(movieId: number, userId: number, isLike: boolean) {
    const movie = await this.movieRepository.findOne({
      where: {
        id: movieId,
      },
    });

    if (!movie) {
      throw new BadRequestException('존재하지 않는 Id');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('사용자 정보 x');
    }

    const likeRecord = await this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    if (likeRecord) {
      if (isLike === likeRecord.isLike) {
        // 좋아요가 있으면 삭제
        await this.movieUserLikeRepository.delete({
          movie,
          user,
        });
      } else {
        await this.movieUserLikeRepository.update(
          {
            movie,
            user,
          },
          {
            isLike,
          },
        );
      }
    } else {
      await this.movieUserLikeRepository.save({
        movie,
        user,
        isLike,
      });
    }

    const result = await this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    return {
      isLike: result && result.isLike,
    };
  }
}
