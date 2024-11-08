import { Exclude, Expose } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export class BaseTable {
  // 프론트엔드로 응답값에 createdAt 제외
  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  // 프론트엔드로 응답값에 updatedAt 제외
  @Exclude()
  updatedAt: Date;

  @VersionColumn()
  // 프론트엔드로 응답값에 version 제외
  @Exclude()
  version: number;
}
