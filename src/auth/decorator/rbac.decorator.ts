import { Reflector } from '@nestjs/core';
import { Role } from 'src/user/entities/user.entity';

// Reflector는 메타데이터를 읽고 접근하기 위해 제공되는 유틸리티 클래스
export const RBAC = Reflector.createDecorator<Role>();
