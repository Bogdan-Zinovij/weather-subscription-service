/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { MailService } from 'src/mail/application/mail.service';
import { WeatherService } from 'src/weather/application/weather.service';
import { ConfigService } from '@nestjs/config';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { SubscriptionRepository } from '../domain/subscription.repository.interface';
import { TokenService } from 'src/token/application/token.service';
import { Subscription } from '../domain/subscription.model';
import { MailTemplates } from 'src/mail/constants/mail.templates';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repo: jest.Mocked<SubscriptionRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let mailService: jest.Mocked<MailService>;
  let weatherService: jest.Mocked<WeatherService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: 'SubscriptionRepository',
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            create: jest.fn(),
            findByValue: jest.fn(),
            findById: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: { sendMail: jest.fn() },
        },
        {
          provide: WeatherService,
          useValue: { getCurrentWeather: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'APP_PORT' ? '3000' : 'localhost',
            ),
          },
        },
      ],
    }).compile();

    service = module.get(SubscriptionService);
    repo = module.get('SubscriptionRepository');
    tokenService = module.get(TokenService);
    mailService = module.get(MailService);
    weatherService = module.get(WeatherService);
  });

  it('should subscribe a new user', async () => {
    repo.find.mockResolvedValue([]);
    tokenService.create.mockResolvedValue({ id: 'token-id', value: 'abc' });
    repo.create.mockResolvedValue({
      id: '1',
      email: 'test@mail.com',
      city: 'Kyiv',
      frequency: SubscriptionFrequencyEnum.HOURLY,
      confirmed: false,
      tokenId: 'token-id',
    });

    await service.subscribe({
      email: 'test@mail.com',
      city: 'Kyiv',
      frequency: SubscriptionFrequencyEnum.HOURLY,
    });

    expect(mailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: MailTemplates.CONFIRM_SUBSCRIPTION.subject,
      }),
    );
  });

  it('should confirm subscription', async () => {
    tokenService.findByValue.mockResolvedValue({
      id: 'token-id',
      value: 'abc',
    });
    repo.find.mockResolvedValue([
      new Subscription(
        '1',
        'test@mail.com',
        'Kyiv',
        SubscriptionFrequencyEnum.HOURLY,
        false,
        'token-id',
      ),
    ]);
    repo.update.mockResolvedValue({
      id: '1',
      email: 'test@mail.com',
      city: 'Kyiv',
      frequency: SubscriptionFrequencyEnum.HOURLY,
      confirmed: true,
      tokenId: 'token-id',
    });
    weatherService.getCurrentWeather.mockResolvedValue({
      temperature: 18,
      humidity: 40,
      description: 'Sunny',
    });

    const result = await service.confirm('abc');

    expect(result.confirmed).toBe(true);
    expect(weatherService.getCurrentWeather).toHaveBeenCalledWith('Kyiv');
    expect(mailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        receiverEmail: 'test@mail.com',
        subject: MailTemplates.SUBSCRIPTION_CONFIRMED.subject,
      }),
    );
  });

  it('should unsubscribe a user and send mail', async () => {
    tokenService.findByValue.mockResolvedValue({
      id: 'token-id',
      value: 'abc',
    });
    repo.find.mockResolvedValue([
      new Subscription(
        '1',
        'test@mail.com',
        'Kyiv',
        SubscriptionFrequencyEnum.HOURLY,
        true,
        'token-id',
      ),
    ]);

    await service.unsubscribe('abc');

    expect(repo.remove).toHaveBeenCalledWith('1');
    expect(mailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: MailTemplates.UNSUBSCRIBE_SUCCESS.subject,
      }),
    );
  });

  it('should send weather to subscribers', async () => {
    repo.find.mockResolvedValue([
      new Subscription(
        '1',
        'test@mail.com',
        'Kyiv',
        SubscriptionFrequencyEnum.HOURLY,
        true,
        'token-id',
      ),
    ]);
    weatherService.getCurrentWeather.mockResolvedValue({
      temperature: 20,
      humidity: 50,
      description: 'Clear',
    });
    tokenService.findById.mockResolvedValue({ id: 'token-id', value: 'abc' });

    await service.sendWeatherToSubscribers(SubscriptionFrequencyEnum.HOURLY);

    expect(mailService.sendMail).toHaveBeenCalled();
  });
});
