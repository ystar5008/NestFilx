import {
  IsArray,
  isArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  // id_52, likeCount_20
  cursor?: string;

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  order: string[] = ['id_DESC'];

  @IsInt()
  @IsOptional()
  // 20~50개
  take: number = 5;
}
