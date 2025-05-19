import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { TokenEntity } from 'src/token/infrastructure/persistence/entities/token.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  city: string;

  @Column()
  frequency: SubscriptionFrequencyEnum;

  @Column({ default: false })
  confirmed: boolean;

  @OneToOne(() => TokenEntity, (token) => token.subscription, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  token: TokenEntity;
}
