import { SubscriptionEntity } from 'src/subscription/infrastructure/persistence/subscription.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tokens')
export class TokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  value: string;

  @OneToOne(() => SubscriptionEntity, (sub) => sub.token, {
    onDelete: 'CASCADE',
  })
  subscription: SubscriptionEntity;
}
