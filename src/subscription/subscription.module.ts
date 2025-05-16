import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionEntity } from './infrastructure/persistence/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionEntity])],
})
export class SubscriptionModule {}
