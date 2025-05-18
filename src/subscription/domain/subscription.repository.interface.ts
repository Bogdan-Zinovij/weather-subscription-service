import { Subscription } from './subscription.model';

export interface SubscriptionRepository {
  create(data: {
    email: string;
    city: string;
    frequency: 'hourly' | 'daily';
    confirmed?: boolean;
    tokenId: string;
  }): Promise<Subscription>;

  find(options: {
    email?: string;
    city?: string;
    frequency?: 'hourly' | 'daily';
    confirmed?: boolean;
    tokenId?: string;
  }): Promise<Subscription[]>;

  update(
    id: string,
    data: Partial<Pick<Subscription, 'confirmed'>>,
  ): Promise<Subscription | null>;

  remove(id: string): Promise<Subscription | null>;
}
