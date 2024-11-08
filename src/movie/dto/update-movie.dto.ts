import { PartialType } from '@nestjs/mapped-types';
import {
  ArrayNotEmpty,
  Contains,
  Equals,
  IsAlpha,
  IsAlphanumeric,
  IsArray,
  IsCreditCard,
  IsDateString,
  IsDefined,
  IsDivisibleBy,
  IsEmpty,
  IsHexColor,
  IsIn,
  IsLatLong,
  IsNegative,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  NotContains,
  Validate,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CreateMovieDto } from './create-movie.dto';

// 커스텀 validator 작성하려면 ValidatorConstraintInterface 인터페이스를
// 구현해야함
// @ValidatorConstraint({
//   // 네트워크 요청 및 비동기 요청으로도 검증 구현가능
//   async: true,
// })
// class PasswordValidator implements ValidatorConstraintInterface {
//   validate(
//     // value: 검증하려는 값
//     value: any,
//     // 검증에 필요한 추가 인자
//     validationArguments?: ValidationArguments,
//   ): Promise<boolean> | boolean {
//     console.log(value);
//     console.log(validationArguments.constraints);
//     console.log(validationArguments.object);
//     console.log(validationArguments.property);
//     console.log(validationArguments.targetName);
//     console.log(validationArguments);
//     return value.length > 4 && value.length;
//   }

//   defaultMessage(validationArguments?: ValidationArguments): string {
//     return '비밀번호의 길이는 4~8자 여야합니다. ($value)';
//   }
// }

// function PasswordValida(validate: ValidationOptions) {}

// PartialType은 객체의 모든 프로퍼티를 옵셔널(?)로 설정함
export class UpdateMoiveDto extends PartialType(CreateMovieDto) {
  // @IsNotEmpty()
  // @IsString()
  // title?: string;
  // @IsNotEmpty()
  // detail?: string;
  // @IsNotEmpty()
  // @IsNumber()
  // directorId?: number;
  // @IsArray()
  // @ArrayNotEmpty()
  // @IsNumber(
  //   {},
  //   {
  //     // 배열에 안에 있는 모든 값이 number 인지 검증
  //     each: true,
  //   },
  // )
  // genreIds?: number[];
}
