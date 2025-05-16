import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  token: string;
}
