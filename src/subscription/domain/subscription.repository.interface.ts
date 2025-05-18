import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { Subscription } from './subscription.model';

export interface SubscriptionRepository {
  create(data: {
    email: string;
    city: string;
    frequency: SubscriptionFrequencyEnum;
    confirmed?: boolean;
    tokenId: string;
  }): Promise<Subscription>;

  find(options: {
    email?: string;
    city?: string;
    frequency?: SubscriptionFrequencyEnum;
    confirmed?: boolean;
    tokenId?: string;
  }): Promise<Subscription[]>;

  update(
    id: string,
    data: Partial<Pick<Subscription, 'confirmed'>>,
  ): Promise<Subscription | null>;

  remove(id: string): Promise<Subscription | null>;
}
