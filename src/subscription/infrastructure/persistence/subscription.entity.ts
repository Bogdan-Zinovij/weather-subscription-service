import { TokenEntity } from 'src/token/infrastructure/persistance/token.entity';
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
  frequency: 'hourly' | 'daily';

  @Column({ default: false })
  confirmed: boolean;

  @OneToOne(() => TokenEntity, (token) => token.subscription, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  token: TokenEntity;
}
