import { IsInt, IsOptional } from 'class-validator';

export class PagePagenation {
  @IsInt()
  @IsOptional()
  page: number = 1;

  @IsInt()
  @IsOptional()
  // 20~50개
  take: number = 5;
}
