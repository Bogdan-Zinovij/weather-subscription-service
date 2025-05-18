import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

export class Subscription {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly city: string,
    public readonly frequency: SubscriptionFrequencyEnum,
    public confirmed: boolean,
  ) {}
}
