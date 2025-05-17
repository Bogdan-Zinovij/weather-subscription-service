import { Injectable, Inject } from '@nestjs/common';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { Subscription } from '../domain/subscription.model';
import { SubscriptionRepository } from '../domain/subscription.repository.interface';
import { v4 as uuidv4, validate as isUuid } from 'uuid';
import { MailService } from 'src/mail/application/mail.service';

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
    private readonly mailService: MailService,
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

    const subscriptionToCreate: Partial<Subscription> = {
      email: dto.email,
      city: dto.city,
      frequency: dto.frequency,
      confirmed: false,
    };

    const token = uuidv4();
    const created = await this.subscriptionRepository.create({
      ...subscriptionToCreate,
      token,
    });

    await this.sendConfirmationEmail(created.email, token);

    return created;
  }

  async confirm(token: string): Promise<Subscription | null> {
    if (!isUuid(token)) {
      throw new SubscriptionError('INVALID_TOKEN');
    }

    const found = await this.subscriptionRepository.find({ token });

    if (found.length === 0) {
      throw new SubscriptionError('TOKEN_NOT_FOUND');
    }

    const subscription = found[0];

    if (subscription.confirmed) {
      return subscription;
    }

    const updated = await this.subscriptionRepository.update(subscription.id, {
      confirmed: true,
    });

    return updated;
  }

  async unsubscribe(token: string): Promise<void> {
    if (!isUuid(token)) {
      throw new SubscriptionError('INVALID_TOKEN');
    }

    const found = await this.subscriptionRepository.find({ token });

    if (found.length === 0) {
      throw new SubscriptionError('TOKEN_NOT_FOUND');
    }

    await this.subscriptionRepository.remove(found[0].id);
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
}
