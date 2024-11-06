import {
  Exclude,
  Expose,
  Transform,
  TransformFnParams,
} from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';

// ManyToOne Director : Movie
// OneToOne Movie : MovieDetial
// ManyToMany Movie : Genre

// @Exclude() 클래스 전체를 응답으로 반환하지 않도록 설정
// 민감한 값
@Entity()
export class Movie extends BaseTable {
  // @Expose()
  @PrimaryGeneratedColumn()
  id: number;
  // @Expose()
  @Column({
    //고유값 제약조건 설정
    unique: true,
  })
  title: string;

  // 요청으로 온 데이터값을 원하는 값으로 변환
  // @Transform(({ value }: TransformFnParams) => (value = '변경'))
  // 직렬화 역직렬화
  // @Expose() //노출하다,
  // @Exclude() // genre라는 값은 반환 응답값에서 제외

  //   get description(){
  //     return `${this.id} ,  `
  //   }

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true,
    // 데이터 생성시 null값 허용 x
    nullable: false,
  })
  // 상속되는 테이블에 join컬럼 명시
  @JoinColumn()
  detail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    // 데이터 생성시 null값 허용 x
    nullable: false,
  })
  director: Director;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];
}