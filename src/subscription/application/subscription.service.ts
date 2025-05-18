import { Injectable, Inject } from '@nestjs/common';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { Subscription } from '../domain/subscription.model';
import { SubscriptionRepository } from '../domain/subscription.repository.interface';
import { MailService } from 'src/mail/application/mail.service';
import { WeatherService } from 'src/weather/application/weather.service';
import { Weather } from 'src/weather/domain/weather.model';
import { TokenService, TokenError } from 'src/token/application/token.service';
import { Token } from 'src/token/domain/token.domain';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly weatherService: WeatherService,
  ) {}

  async subscribe(dto: CreateSubscriptionDto): Promise<Subscription> {
    const existing = await this.subscriptionRepository.find({
      email: dto.email,
      city: dto.city,
      frequency: dto.frequency,
    });
    if (existing.length > 0) {
      throw new SubscriptionError('EMAIL_ALREADY_SUBSCRIBED');
    }

    const token = await this.tokenService.create();

    const subscription = await this.subscriptionRepository.create({
      email: dto.email,
      city: dto.city,
      frequency: dto.frequency,
      confirmed: false,
      tokenId: token.id,
    });

    await this.sendConfirmationEmail(subscription.email, token.value);
    return subscription;
  }

  async confirm(tokenValue: string): Promise<Subscription> {
    let token: Token;
    try {
      token = await this.tokenService.findByValue(tokenValue);
    } catch (err) {
      if (err instanceof TokenError) {
        throw new SubscriptionError(err.message);
      }
      throw err;
    }

    const found = await this.subscriptionRepository.find({ tokenId: token.id });
    if (found.length === 0) {
      throw new SubscriptionError('TOKEN_NOT_FOUND');
    }

    const subscription = found[0];
    if (subscription.confirmed) return subscription;

    return (await this.subscriptionRepository.update(subscription.id, {
      confirmed: true,
    })) as Subscription;
  }

  async unsubscribe(tokenValue: string): Promise<void> {
    let token: Token;
    try {
      token = await this.tokenService.findByValue(tokenValue);
    } catch (err) {
      if (err instanceof TokenError) {
        throw new SubscriptionError(err.message);
      }
      throw err;
    }

    const subscriptions = await this.subscriptionRepository.find({
      tokenId: token.id,
    });

    if (subscriptions.length === 0) {
      throw new SubscriptionError('TOKEN_NOT_FOUND');
    }

    await this.subscriptionRepository.remove(subscriptions[0].id);
    await this.tokenService.remove(token.id);
  }

  private async sendConfirmationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    await this.mailService.sendMail({
      receiverEmail: email,
      subject: 'Confirm your subscription',
      text: `Use this token to confirm your subscription: ${token}`,
    });
  }

  async getConfirmedSubscriptionsByFrequency(
    frequency: SubscriptionFrequencyEnum,
  ): Promise<Subscription[]> {
    return this.subscriptionRepository.find({ frequency, confirmed: true });
  }

  async sendWeatherToSubscribers(
    frequency: SubscriptionFrequencyEnum,
  ): Promise<void> {
    const subscribers =
      await this.getConfirmedSubscriptionsByFrequency(frequency);

    const weatherCache = new Map<string, Weather>();

    for (const sub of subscribers) {
      try {
        let weather: Weather;
        if (weatherCache.has(sub.city)) {
          weather = weatherCache.get(sub.city)!;
        } else {
          weather = await this.weatherService.getCurrentWeather(sub.city);
          weatherCache.set(sub.city, weather);
        }

        const emailBody = `Current weather in ${sub.city}:\nTemperature: ${weather.temperature}°C\nHumidity: ${weather.humidity}%\nDescription: ${weather.description}`;

        await this.mailService.sendMail({
          receiverEmail: sub.email,
          subject: `Weather update for ${sub.city}`,
          text: emailBody,
        });
      } catch (err) {
        console.error(`Failed to send weather to ${sub.email}:`, err);
      }
    }
  }
}
