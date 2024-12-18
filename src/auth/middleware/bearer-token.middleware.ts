// import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { envVariableKeys } from 'src/common/const/env.const';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    // @Inject(CACHE_MANAGER)
    // private readonly cacheManager: Cache,
  ) {}

  // NestMiddleware 구현시 use함수 구현
  async use(req: Request, res: Response, next: NextFunction) {
    /// Basic $token
    /// Bearer $token
    const authHeader = req.headers['authorization'];

    // 헤더가 없으면 인증 시도가 아니기 때문에 다음 으로 이동
    if (!authHeader) {
      next();
      return;
    }

    const token = this.validateBearerToken(authHeader);

    // const blockedToken = await this.cacheManager.get(`BLOCK_TOKEN_${token}`);

    // if(blockedToken){
    //     throw new UnauthorizedException('차단된 토큰입니다!');
    // }

    const tokenKey = `TOKEN_${token}`;

    //const cachedPayload = await this.cacheManager.get(tokenKey);

    // if (cachedPayload) {
    //     req.user = cachedPayload;

    //     return next();
    // }

    const decodedPayload = this.jwtService.decode(token);

    if (decodedPayload.type !== 'refresh' && decodedPayload.type !== 'access') {
      throw new UnauthorizedException('잘못된 토큰입니다!');
    }

    try {
      const secretKey =
        decodedPayload.type === 'refresh'
          ? envVariableKeys.refreshTokenSecret
          : envVariableKeys.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secretKey),
      });

      /// payload['exp'] -> epoch time seconds
      const expiryDate = +new Date(payload['exp'] * 1000);
      const now = +Date.now();

      const differenceInSeconds = (expiryDate - now) / 1000;

      // await this.cacheManager.set(tokenKey, payload,
      //     Math.max((differenceInSeconds - 30) * 1000, 1)
      // )

      // 다음로직에서 payload 가져오기
      req.user = payload;
      next();
    } catch (e) {
      // 토큰 만려 에러 발생시 프론트로 에러전달
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료됐습니다.');
      }

      // 퍼블릭 라우터는 토큰 확인안함
      next();
    }
  }

  validateBearerToken(rawToken: string) {
    // 토큰 검증
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    const [bearer, token] = basicSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    return token;
  }
}
