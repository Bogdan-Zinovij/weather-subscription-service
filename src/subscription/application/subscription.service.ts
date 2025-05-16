import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import { Subscription } from '../domain/subscription.model';
import { SubscriptionRepository } from '../domain/subscription.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('SubscriptionRepository')
    private readonly subscriptionRepository: SubscriptionRepository,
    // private readonly mailService: MailService
  ) {}

  async subscribe(dto: CreateSubscriptionDto): Promise<Subscription> {
    const existing = await this.subscriptionRepository.find({
      email: dto.email,
      city: dto.city,
      frequency: dto.frequency,
    });

    if (existing.length > 0) {
      throw new HttpException('Email already subscribed', HttpStatus.CONFLICT);
    }

    const subscriptionToCreate: Partial<Subscription> = {
      email: dto.email,
      city: dto.city,
      frequency: dto.frequency,
      confirmed: false,
    };

    const created = await this.subscriptionRepository.create({
      ...subscriptionToCreate,
      token: uuidv4(),
    });

    this.sendConfirmationEmail(created.email, created['token']);

    return created;
  }

  async confirm(token: string): Promise<Subscription | null> {
    if (!token) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    const found = await this.subscriptionRepository.find({ token });

    if (found.length === 0) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }

    const subscription = found[0];

    if (subscription.confirmed) {
      return subscription;
    }

    const updated = await this.subscriptionRepository.update(
      subscription['token'],
      { confirmed: true },
    );

    return updated;
  }

  // Відписка
  async unsubscribe(token: string): Promise<void> {
    if (!token) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    const found = await this.subscriptionRepository.find({ token });

    if (found.length === 0) {
      throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
    }

    await this.subscriptionRepository.remove(found[0].id);
  }

  private sendConfirmationEmail(email: string, token: string): void {
    console.log(`Send confirmation email to ${email} with token: ${token}`);
  }
}
