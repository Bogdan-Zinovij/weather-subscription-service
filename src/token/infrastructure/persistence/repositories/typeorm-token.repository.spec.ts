/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmTokenRepository } from './typeorm-token.repository';
import { TokenEntity } from '../entities/token.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from 'src/token/domain/token.domain';
import { SubscriptionEntity } from 'src/subscription/infrastructure/persistence/entities/subscription.entity';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';

describe('TypeOrmTokenRepository', () => {
  let repository: TypeOrmTokenRepository;
  let mockRepo: jest.Mocked<Repository<TokenEntity>>;

  const createSubscriptionEntity = (): SubscriptionEntity => {
    const subscription = new SubscriptionEntity();
    subscription.id = 'sub-id';
    subscription.email = 'test@example.com';
    subscription.city = 'Kyiv';
    subscription.frequency = SubscriptionFrequencyEnum.DAILY;
    subscription.confirmed = false;
    return subscription;
  };

  const createTokenEntity = (id: string, value: string): TokenEntity => ({
    id,
    value,
    subscription: createSubscriptionEntity(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmTokenRepository,
        {
          provide: getRepositoryToken(TokenEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get(TypeOrmTokenRepository);
    mockRepo = module.get(getRepositoryToken(TokenEntity));
  });

  afterEach(() => jest.clearAllMocks());

  it('should create and return token', async () => {
    const tokenValue = 'test-token';
    const entity = createTokenEntity('1', tokenValue);

    mockRepo.create.mockReturnValue(entity);
    mockRepo.save.mockResolvedValue(entity);

    const result = await repository.create(tokenValue);
    expect(mockRepo.create).toHaveBeenCalledWith({ value: tokenValue });
    expect(mockRepo.save).toHaveBeenCalledWith(entity);
    expect(result).toEqual(new Token(entity.id, tokenValue));
  });

  it('should find token by id', async () => {
    const entity = createTokenEntity('2', 'abc');
    mockRepo.findOne.mockResolvedValueOnce(entity);

    const result = await repository.findById('2');
    expect(result).toEqual(new Token('2', 'abc'));
  });

  it('should return null if not found by id', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);
    const result = await repository.findById('not-found');
    expect(result).toBeNull();
  });

  it('should find token by value', async () => {
    const entity = createTokenEntity('3', 'xyz');
    mockRepo.findOne.mockResolvedValueOnce(entity);

    const result = await repository.findByValue('xyz');
    expect(result).toEqual(new Token('3', 'xyz'));
  });

  it('should return null if not found by value', async () => {
    mockRepo.findOne.mockResolvedValueOnce(null);
    const result = await repository.findByValue('none');
    expect(result).toBeNull();
  });

  it('should call delete with correct id', async () => {
    await repository.remove('token-id');
    expect(mockRepo.delete).toHaveBeenCalledWith({ id: 'token-id' });
  });
});
