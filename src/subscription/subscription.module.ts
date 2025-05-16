import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionController } from './infrastructure/subscription.controller';
import { SubscriptionEntity } from './infrastructure/persistence/subscription.entity';
import { TypeOrmSubscriptionRepository } from './infrastructure/persistence/typeorm-subscription.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionEntity])],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    {
      provide: 'SubscriptionRepository',
      useClass: TypeOrmSubscriptionRepository,
    },
  ],
})
export class SubscriptionModule {}
