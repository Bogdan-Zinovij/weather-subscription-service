import { Injectable, Inject } from '@nestjs/common';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { Subscription } from '../domain/subscription.model';
import { SubscriptionRepository } from '../domain/subscription.repository.interface';
import { MailService } from 'src/mail/application/mail.service';
import { WeatherService } from 'src/weather/application/weather.service';
import { Weather } from 'src/weather/domain/weather.model';
import { TokenService } from 'src/token/application/token.service';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { SubscriptionErrorCode } from '../constants/subscription.errors';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionService {
  private readonly appPort: string;
  private readonly appDomain: string;

  constructor(
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly weatherService: WeatherService,
    private readonly configService: ConfigService,
  ) {
    this.appPort = this.configService.get<string>('APP_PORT') ?? '3000';
    this.appDomain =
      this.configService.get<string>('APP_DOMAIN') ?? 'localhost';
  }

  async subscribe(dto: CreateSubscriptionDto): Promise<Subscription> {
    const existing = await this.subscriptionRepository.find({
      email: dto.email,
      city: dto.city,
      frequency: dto.frequency,
    });
    if (existing.length > 0) {
      throw new Error(SubscriptionErrorCode.EMAIL_ALREADY_SUBSCRIBED);
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
    const token = await this.tokenService.findByValue(tokenValue);

    const found = await this.subscriptionRepository.find({ tokenId: token.id });
    if (found.length === 0) {
      throw new Error(SubscriptionErrorCode.TOKEN_NOT_FOUND);
    }

    const subscription = found[0];
    if (subscription.confirmed) return subscription;

    return (await this.subscriptionRepository.update(subscription.id, {
      confirmed: true,
    })) as Subscription;
  }

  async unsubscribe(tokenValue: string): Promise<void> {
    const token = await this.tokenService.findByValue(tokenValue);

    const subscriptions = await this.subscriptionRepository.find({
      tokenId: token.id,
    });

    if (subscriptions.length === 0) {
      throw new Error(SubscriptionErrorCode.TOKEN_NOT_FOUND);
    }

    const subscription = subscriptions[0];
    await this.subscriptionRepository.remove(subscription.id);
    await this.tokenService.remove(token.id);
    await this.mailService.sendMail({
      receiverEmail: subscription.email,
      subject: 'Unsubscription',
      html: '<p>Subscription cancellation successfully completed</p>',
    });
  }

  private async sendConfirmationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const confirmLink = `http://${this.appDomain}:${this.appPort}/subscription/confirm/${token}`;

    await this.mailService.sendMail({
      receiverEmail: email,
      subject: 'Confirm your subscription',
      html: `Click the link below to confirm your subscription:<br><a href="${confirmLink}">${confirmLink}</a>`,
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

        const token = await this.tokenService.findById(sub.tokenId);
        const unsubscribeLink = `http://${this.appDomain}:${this.appPort}/subscription/unsubscribe/${token.value}`;

        const emailHtmlBody = `
          <p>Current weather in <strong>${sub.city}</strong>:</p>
          <ul>
            <li>Temperature: ${weather.temperature}°C</li>
            <li>Humidity: ${weather.humidity}%</li>
            <li>Description: ${weather.description}</li>
          </ul>
          <p>If you no longer wish to receive updates, you can 
          <a href="${unsubscribeLink}">unsubscribe here</a>.</p>
        `;

        await this.mailService.sendMail({
          receiverEmail: sub.email,
          subject: `Weather update for ${sub.city}`,
          html: emailHtmlBody,
        });
      } catch (err) {
        console.error(`Failed to send weather to ${sub.email}:`, err);
      }
    }
  }
}
