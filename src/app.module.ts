import {
  LoggerService,
  LogLevel,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { ChatModule } from './chat/chat.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as joi from 'joi';
import { Movie } from './movie/entity/movie.entity';
import { MovieDetail } from './movie/entity/movie-detail.entity';
import { DirectorModule } from './director/director.module';
import { Director } from './director/entity/director.entity';
import { GenreModule } from './genre/genre.module';
import { Genre } from './genre/entity/genre.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { envVariableKeys } from './common/const/env.const';
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  NestApplication,
} from '@nestjs/core';
import { NestMicroserviceOptions } from '@nestjs/common/interfaces/microservices/nest-microservice-options.interface';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { AuthGuard } from './auth/guard/auth.guard';
import { RBACGuard } from './auth/guard/rbac.gurad';
import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';
import { ForbiddenExceptionFilter } from './common/filter/forbidden.filter';
import { QueryFailedExceptionFilter } from './common/filter/query-failed.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MovieUserLike } from './movie/entity/movie-user-like.entity';

@Module({
  // 모듈을 불러들임
  imports: [
    ConfigModule.forRoot({
      // 모듈에 상관없이 configmodule에 등록된 환경변수 사용 설정
      isGlobal: true,
      // 환경변수 검증
      validationSchema: joi.object({
        ENV: joi.string().valid('dev', 'prod').required(),
        DB_TYPE: joi.string().valid('mysql').required(),
        DB_HOST: joi.string().required(),
        DB_PORT: joi.number().required(),
        DB_USERNAME: joi.string().required(),
        DB_PASSWORD: joi.string().required(),
        DB_DATABASE: joi.string().required(),
        HASH_ROUNDS: joi.number().required(),
        ACCESS_TOKEN_SECRET: joi.string().required(),
        REFERSH_TOKEN_SECRET: joi.string().required(),
      }),
    }),
    // 비동기로 forRootAsync
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>(envVariableKeys.dbType) as 'mysql',
        host: configService.get<string>(envVariableKeys.dbHost),
        port: configService.get<number>(envVariableKeys.dbPort),
        username: configService.get<string>(envVariableKeys.dbUsername),
        password: configService.get<string>(envVariableKeys.dbPassword),
        database: configService.get<string>(envVariableKeys.dbDatabase),
        entities: [Movie, MovieDetail, Director, Genre, User, MovieUserLike],
        logging: true,
        synchronize: true,
      }),
      // ConfigServie 주입
      inject: [ConfigService],
    }),
    // TypeOrmModule.forRoot({
    //   type: process.env.DB_TYPE as 'mysql',
    //   host: process.env.DB_HOST,
    //   port: parseInt(process.env.DB_PORT),
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_DATABASE,
    //   entities: [],
    //   synchronize: true,
    // }),
    MovieModule,
    DirectorModule,
    ChatModule,
    GenreModule,
    AuthModule,
    UserModule,
    ServeStaticModule.forRoot({
      //퍼블릭 폴더만 서빙
      rootPath: join(process.cwd(), 'public'),
      // public 폴더 안에 있는
      serveRoot: '/public/',
    }),
  ],
  providers: [
    {
      // 프로젝트 모든 라우터에 가드 적용
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RBACGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ForbiddenExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: QueryFailedExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  // configure 함수 구현
  configure(consumer: MiddlewareConsumer) {
    // 추가할 미들웨어
    consumer
      .apply(
        BearerTokenMiddleware,

        // 모든 라우터에 적용
      )
      // 미들웨어를 제외할 라우터 경로 및 http 메서드
      .exclude(
        {
          path: 'auth/login',
          method: RequestMethod.POST,
        },
        {
          path: 'auth/register',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
