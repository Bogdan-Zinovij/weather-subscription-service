/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmSubscriptionRepository } from './typeorm-subscription.repository';
import { SubscriptionEntity } from '../entities/subscription.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

describe('TypeOrmSubscriptionRepository', () => {
  let repo: TypeOrmSubscriptionRepository;
  let ormRepo: jest.Mocked<Repository<SubscriptionEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmSubscriptionRepository,
        {
          provide: getRepositoryToken(SubscriptionEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get(TypeOrmSubscriptionRepository);
    ormRepo = module.get(getRepositoryToken(SubscriptionEntity));
  });

  it('should create subscription', async () => {
    const entity = {
      email: 'test@mail.com',
      city: 'Kyiv',
      frequency: SubscriptionFrequencyEnum.HOURLY,
      token: { id: 'token-id' },
      confirmed: false,
    };
    const saved = { ...entity, id: '1' };
    ormRepo.create.mockReturnValue(entity as any);
    ormRepo.save.mockResolvedValue(saved as any);

    const result = await repo.create({
      email: entity.email,
      city: entity.city,
      frequency: entity.frequency,
      tokenId: entity.token.id,
    });

    expect(result).toEqual(
      expect.objectContaining({ id: '1', email: 'test@mail.com' }),
    );
  });

  it('should find subscriptions', async () => {
    ormRepo.find.mockResolvedValue([
      {
        id: '1',
        email: 'test@mail.com',
        city: 'Kyiv',
        frequency: SubscriptionFrequencyEnum.HOURLY,
        confirmed: true,
        token: { id: 'token-id' },
      } as SubscriptionEntity,
    ]);

    const result = await repo.find({ email: 'test@mail.com' });

    expect(result).toHaveLength(1);
    expect(result[0].email).toBe('test@mail.com');
  });

  it('should update subscription', async () => {
    const entity = {
      id: '1',
      email: 'test@mail.com',
      city: 'Kyiv',
      frequency: SubscriptionFrequencyEnum.HOURLY,
      confirmed: false,
      token: { id: 'token-id' },
    } as SubscriptionEntity;

    ormRepo.findOne.mockResolvedValue(entity);
    ormRepo.save.mockResolvedValue({ ...entity, confirmed: true });

    const updated = await repo.update('1', { confirmed: true });

    expect(updated?.confirmed).toBe(true);
  });

  it('should return null if subscription not found in update', async () => {
    ormRepo.findOne.mockResolvedValue(null);
    const updated = await repo.update('not-found', { confirmed: true });
    expect(updated).toBeNull();
  });

  it('should remove subscription', async () => {
    const entity = { id: '1', token: { id: 'token-id' } } as SubscriptionEntity;
    ormRepo.findOne.mockResolvedValue(entity);
    const result = await repo.remove('1');
    expect(result).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(ormRepo.remove).toHaveBeenCalledWith(entity);
  });

  it('should return null if subscription not found in remove', async () => {
    ormRepo.findOne.mockResolvedValue(null);
    const result = await repo.remove('not-found');
    expect(result).toBeNull();
  });
});
