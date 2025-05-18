import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenRepository } from './infrastructure/persistance/typeorm-token.repository';
import { TokenEntity } from './infrastructure/persistance/token.entity';
import { TokenService } from './application/token.service';

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity])],
  providers: [
    TokenService,
    TokenRepository,
    {
      provide: 'TokenRepository',
      useClass: TokenRepository,
    },
  ],
  exports: [TokenService],
})
export class TokenModule {}
