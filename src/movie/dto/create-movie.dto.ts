import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  // 빈값이 아니어야함
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  detail: string;

  // @IsNotEmpty()
  // @IsString()
  // genre: string;

  @IsNotEmpty()
  @IsNumber()
  directorId: number;

  @IsArray()
  // 비어있지 않은 배열
  @ArrayNotEmpty()
  @IsNumber(
    {},
    {
      // 배열에 안에 있는 모든 값이 number 인지 검증
      each: true,
    },
  )
  genreIds: number[];
}
