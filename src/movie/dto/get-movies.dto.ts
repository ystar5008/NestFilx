import { IsInt, IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from 'src/common/dto/cursor-pagination.dto';
import { PagePagenation } from 'src/common/dto/page-pagination.dto';

// 상속
// export class GetMoivesDto extends PagePagenation {
//   @IsString()
//   @IsOptional()
//   title?: string;
// }

export class GetMoivesDto extends CursorPaginationDto {
  @IsString()
  @IsOptional()
  title?: string;
}
