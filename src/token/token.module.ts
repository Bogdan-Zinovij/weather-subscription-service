import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmTokenRepository } from './infrastructure/persistance/typeorm-token.repository';
import { TokenEntity } from './infrastructure/persistance/token.entity';
import { TokenService } from './application/token.service';

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity])],
  providers: [
    TokenService,
    {
      provide: 'TokenRepository',
      useClass: TypeOrmTokenRepository,
    },
  ],
  exports: [TokenService],
})
export class TokenModule {}
