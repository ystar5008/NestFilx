import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectorDto } from './create-director.dto';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

// PartialType => 상속받은 객체의 모든 프로퍼티를 옵셔널로 설정함
export class UpdateDirectorDto extends PartialType(CreateDirectorDto) {
  // @IsNotEmpty()
  // @IsString()
  // @IsOptional()
  // name?: string;
  // @IsNotEmpty()
  // @IsDateString()
  // @IsOptional()
  // dob?: Date;
  // @IsNotEmpty()
  // @IsString()
  // @IsOptional()
  // nationality?: string;
}
