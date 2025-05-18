import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from './subscription.service';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

@Injectable()
export class SubscriptionCronService {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlySubscriptions() {
    await this.subscriptionService.sendWeatherToSubscribers(
      SubscriptionFrequencyEnum.HOURLY,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleDailySubscriptions() {
    await this.subscriptionService.sendWeatherToSubscribers(
      SubscriptionFrequencyEnum.DAILY,
    );
  }
}
