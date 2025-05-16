import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from './subscription.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from '../../domain/subscription.model';
import { SubscriptionRepository } from '../../domain/subscription.repository.interface';

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
    );
  }

  async create(
    data: Partial<Subscription> & { token: string },
  ): Promise<Subscription> {
    const entity = this.repo.create({
      email: data.email,
      city: data.city,
      frequency: data.frequency,
      confirmed: data.confirmed ?? false,
      token: data.token,
    });

    const saved = await this.repo.save(entity);
    return this.mapEntityToDomain(saved);
  }

  async find(
    options: Partial<Subscription> | { token?: string },
  ): Promise<Subscription[]> {
    if ('token' in options && options.token) {
      const entity = await this.repo.findOne({
        where: { token: options.token },
      });
      return entity ? [this.mapEntityToDomain(entity)] : [];
    }

    const entities = await this.repo.find({ where: options });
    return entities.map((e) => this.mapEntityToDomain(e));
  }

  async update(
    id: string,
    data: Partial<Subscription>,
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
