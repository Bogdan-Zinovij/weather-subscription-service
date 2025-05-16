import { Subscription } from './subscription.model';

export interface SubscriptionRepository {
  create(
    data: Partial<Subscription> & { token: string },
  ): Promise<Subscription>;
  find(
    options: Partial<Subscription> | { token?: string },
  ): Promise<Subscription[]>;
  update(id: string, data: Partial<Subscription>): Promise<Subscription | null>;
  remove(id: string): Promise<Subscription | null>;
}
