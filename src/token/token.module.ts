import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmTokenRepository } from './infrastructure/persistence/repositories/typeorm-token.repository';
import { TokenEntity } from './infrastructure/persistence/entities/token.entity';
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
