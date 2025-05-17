import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionController } from './infrastructure/subscription.controller';
import { SubscriptionEntity } from './infrastructure/persistence/subscription.entity';
import { TypeOrmSubscriptionRepository } from './infrastructure/persistence/typeorm-subscription.repository';
import { MailModule } from 'src/mail/mail.module';
import { WeatherModule } from 'src/weather/weather.module';
import { SubscriptionCronService } from './application/subscription.cron';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionEntity]),
    ScheduleModule.forRoot(),
    MailModule,
    WeatherModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionCronService,
    {
      provide: 'SubscriptionRepository',
      useClass: TypeOrmSubscriptionRepository,
    },
  ],
})
export class SubscriptionModule {}
