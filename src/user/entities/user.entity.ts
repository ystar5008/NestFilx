import { Exclude } from 'class-transformer';
import { BaseTable } from 'src/common/entity/base.entity';

import { Movie } from 'src/movie/entity/movie.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  admin,
  paidUser,
  user,
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  // 응답에 비밀번호 제외
  @Exclude({
    // toClassOnly: true, => 요청 받을 때
    // 응답 할 때
    toPlainOnly: true,
  })
  password: string;

  @Column({
    // mysql은 type을 enum으로 지정
    type: 'enum',
    enum: Role,
    default: Role.user,
  })
  role: Role;

  // @OneToMany(
  //     () => Movie,
  //     (movie) => movie.creator,
  // )
  // createdMovies: Movie[];

  // @OneToMany(
  //     () => MovieUserLike,
  //     (mul) => mul.user,
  // )
  // likedMovies: MovieUserLike[]
}