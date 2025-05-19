/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionCronService } from './subscription.cron';
import { SubscriptionService } from '../subscription.service';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

describe('SubscriptionCronService', () => {
  let cronService: SubscriptionCronService;
  let subscriptionService: jest.Mocked<SubscriptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionCronService,
        {
          provide: SubscriptionService,
          useValue: {
            sendWeatherToSubscribers: jest.fn(),
          },
        },
      ],
    }).compile();

    cronService = module.get(SubscriptionCronService);
    subscriptionService = module.get(SubscriptionService);
  });

  it('should call sendWeatherToSubscribers with HOURLY', async () => {
    await cronService.handleHourlySubscriptions();
    expect(subscriptionService.sendWeatherToSubscribers).toHaveBeenCalledWith(
      SubscriptionFrequencyEnum.HOURLY,
    );
  });

  it('should call sendWeatherToSubscribers with DAILY', async () => {
    await cronService.handleDailySubscriptions();
    expect(subscriptionService.sendWeatherToSubscribers).toHaveBeenCalledWith(
      SubscriptionFrequencyEnum.DAILY,
    );
  });
});
