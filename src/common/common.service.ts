import { BadRequestException, Injectable } from '@nestjs/common';
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

  async applycursorPaginationParamsToQb<T>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    let { cursor, take, order } = dto;

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');

      /**
       * {
       *   values: {
       *      id:27
       *  },
       *  order:['id_DESC']
       * }
       *
       */
      const cursorObj = JSON.parse(decodedCursor);

      order = cursorObj.order;

      const { values } = cursorObj;

      /// (column1, column2, column3) > (va1, 2 ,3)

      const columns = Object.keys(values);

      const comparisonOperator = order.some((o) => o.endsWith('DESC'))
        ? '<'
        : '>';
      const whereConditions = columns.map((c) => `${qb.alias}.${c}`).join(',');
      const whereParams = columns.map((c) => `:${c}`).join(',');

      qb.where(
        `(${whereConditions}) ${comparisonOperator} (${whereParams})`,
        values,
      );
    }

    // [likCount_DESC , id_DESC ]
    for (let i = 0; i < order.length; i++) {
      const [column, direction] = order[i].split('_');

      if (direction !== 'ASC' && direction !== 'DESC') {
        throw new BadRequestException('Order는 ASC 또는 DESC');
      }

      if (i === 0) {
        // qb.alias = 현재테이블 별칭
        qb.orderBy(`${qb.alias}.${column}`, direction);
      } else {
        qb.addOrderBy(`${qb.alias}.${column}`, direction);
      }
    }

    qb.take(take);
    this.consoleFunction(qb);
    const results = await qb.getMany();

    const nextCursor = this.generateNextCursor(results, order);

    return { qb, nextCursor };
  }

  consoleFunction<T>(qb: SelectQueryBuilder<T>) {
    console.log('쿼리시작' + qb.getQuery() + '쿼리끝');
  }

  generateNextCursor<T>(results: T[], order: string[]): string | null {
    if (results.length === 0) return null;

    /**
     * {
     *   values: {
     *      id:27
     *  },
     *  order:['id_DESC']
     * }
     *
     */

    const lastItem = results[results.length - 1];

    const values = {};

    order.forEach((columnOrder) => {
      const [column] = columnOrder.split('_');

      values[column] = lastItem[column];
    });

    const cursorObj = { values, order };

    const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString(
      'base64',
    );

    return nextCursor;
  }
}
