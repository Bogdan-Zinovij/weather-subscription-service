import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class SubscriptionCronService {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlySubscriptions() {
    await this.subscriptionService.sendWeatherToSubscribers('hourly');
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleDailySubscriptions() {
    await this.subscriptionService.sendWeatherToSubscribers('daily');
  }
}
