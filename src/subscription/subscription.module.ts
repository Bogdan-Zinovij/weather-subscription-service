import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionService } from './application/subscription.service';
import { SubscriptionController } from './interfaces/controllers/subscription.controller';
import { SubscriptionEntity } from './infrastructure/persistence/entities/subscription.entity';
import { TypeOrmSubscriptionRepository } from './infrastructure/persistence/repositories/typeorm-subscription.repository';
import { MailModule } from 'src/mail/mail.module';
import { WeatherModule } from 'src/weather/weather.module';
import { SubscriptionCronService } from './application/cron/subscription.cron';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionEntity]),
    ScheduleModule.forRoot(),
    ConfigModule,
    MailModule,
    WeatherModule,
    TokenModule,
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
