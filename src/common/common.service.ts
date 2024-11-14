import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PagePagenation } from './dto/page-pagination.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
import { dir } from 'console';

@Injectable()
export class CommonService {
  constructor() {}

  // <T>는 제네릭 타입 매개변수
  // T는 호출할 떄 실제 엔티티 타입으로 대체됨
  // T는 User 혹은 Product등 실제 엔티티의 타입으로 입력됨
  // applyPagePaginationParamsToQb<Movie>
  // applyPagePaginationParamsToQb<User>
  // applyPagePaginationParamsToQb<Genre>
  // 함수는 다양한 엔티티타입에 대해 재사용할 수 잇음
  applyPagePaginationParamsToQb<T>(
    // 실제 입력되는 엔티티 타입에 대체됨
    // SelectQueryBuilder<Movie>
    // SelectQueryBuilder<User>
    // SelectQueryBuilder<Genre>
    qb: SelectQueryBuilder<T>,
    dto: PagePagenation,
  ) {
    // 현재까지 작성된 실행쿼리 확인
    const { page, take } = dto;
    const skip = (page - 1) * take;
    qb.take(take);
    qb.skip(skip);
    this.consoleFunction(qb);
  }

  applycursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    const { order, take, id } = dto;

    if (id) {
      const direction = order === 'ASC' ? '>' : '<';

      // order -> asc : movie.id : id
      qb.where(`${qb.alias}.id ${direction} :id`, { id });
    }

    //선택한 테이블 qb.alias
    // id를 기준으로 정렬
    qb.orderBy(`${qb.alias}.id`, order);
    qb.take(take);
    this.consoleFunction(qb);
  }

  consoleFunction<T>(qb: SelectQueryBuilder<T>) {
    console.log('쿼리시작' + qb.getQuery() + '쿼리끝');
  }
}
