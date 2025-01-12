import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Movie } from './movie.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class MovieUserLike {
  //compose PK
  @PrimaryColumn({
    name: 'movieId',
    type: 'int8',
  })
  @ManyToOne(() => Movie, (movie) => movie.likedUsers)
  // 여러개의 영화 여러개의 사용자
  // 실제 DB에는 movieId로 컬럼이 생성되고 FK로 연결
  movie: Movie;

  //compose PK
  @PrimaryColumn({
    name: 'userId',
    type: 'int8',
  })
  @ManyToOne(() => User, (user) => user.likedMovies)
  // 실제 DB에는 userId 컬럼이 생성되고 FK로 연결
  user: User;

  @Column()
  isLike: Boolean;
}
