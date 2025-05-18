import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from './subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from '../../domain/subscription.model';
import { SubscriptionRepository } from '../../domain/subscription.repository.interface';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

@Injectable()
export class TypeOrmSubscriptionRepository implements SubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly repo: Repository<SubscriptionEntity>,
  ) {}

  private mapEntityToDomain(entity: SubscriptionEntity): Subscription {
    return new Subscription(
      entity.id,
      entity.email,
      entity.city,
      entity.frequency,
      entity.confirmed,
      entity.token.id,
    );
  }

  async create(data: {
    email: string;
    city: string;
    frequency: SubscriptionFrequencyEnum;
    confirmed?: boolean;
    tokenId: string;
  }): Promise<Subscription> {
    const entity = this.repo.create({
      email: data.email,
      city: data.city,
      frequency: data.frequency,
      confirmed: data.confirmed ?? false,
      token: { id: data.tokenId },
    });

    const saved = await this.repo.save(entity);
    return this.mapEntityToDomain(saved);
  }

  async find(options: {
    email?: string;
    city?: string;
    frequency?: SubscriptionFrequencyEnum;
    confirmed?: boolean;
    tokenId?: string;
  }): Promise<Subscription[]> {
    const entities = await this.repo.find({
      where: {
        ...(options.email && { email: options.email }),
        ...(options.city && { city: options.city }),
        ...(options.frequency && { frequency: options.frequency }),
        ...(options.confirmed !== undefined && {
          confirmed: options.confirmed,
        }),
        ...(options.tokenId && { token: { id: options.tokenId } }),
      },
      relations: options.tokenId ? ['token'] : [],
    });

    return entities.map((e) => this.mapEntityToDomain(e));
  }

  async update(
    id: string,
    data: Partial<Pick<Subscription, 'confirmed'>>,
  ): Promise<Subscription | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;

    Object.assign(entity, data);
    const saved = await this.repo.save(entity);
    return this.mapEntityToDomain(saved);
  }

  async remove(id: string): Promise<Subscription | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;

    await this.repo.remove(entity);
    return this.mapEntityToDomain(entity);
  }
}
