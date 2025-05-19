/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { TokenRepository } from '../domain/token.repository.interface';
import { Token } from '../domain/token.domain';
import { TokenErrorCode } from '../constants/token.errors';
import { v4 as uuidv4 } from 'uuid';

describe('TokenService', () => {
  let service: TokenService;
  let tokenRepository: jest.Mocked<TokenRepository>;

  const mockRepo: jest.Mocked<TokenRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByValue: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: 'TokenRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    tokenRepository = module.get('TokenRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create and return a token', async () => {
    const value = uuidv4();
    const fakeToken = new Token('123', value);

    tokenRepository.create.mockResolvedValueOnce(fakeToken);

    const result = await service.create();

    expect(tokenRepository.create).toHaveBeenCalled();
    expect(result).toEqual(fakeToken);
  });

  describe('findByValue', () => {
    it('should return token by value', async () => {
      const value = uuidv4();
      const token = new Token('321', value);
      tokenRepository.findByValue.mockResolvedValueOnce(token);

      const result = await service.findByValue(value);
      expect(result).toEqual(token);
      expect(tokenRepository.findByValue).toHaveBeenCalledWith(value);
    });

    it('should throw if value is not a UUID', async () => {
      await expect(service.findByValue('not-a-uuid')).rejects.toThrow(
        TokenErrorCode.INVALID_TOKEN,
      );
    });

    it('should throw if token not found', async () => {
      const value = uuidv4();
      tokenRepository.findByValue.mockResolvedValueOnce(null);

      await expect(service.findByValue(value)).rejects.toThrow(
        TokenErrorCode.TOKEN_NOT_FOUND,
      );
    });
  });

  describe('findById', () => {
    it('should return token by id', async () => {
      const id = uuidv4();
      const token = new Token(id, 'some-value');
      tokenRepository.findById.mockResolvedValueOnce(token);

      const result = await service.findById(id);
      expect(result).toEqual(token);
      expect(tokenRepository.findById).toHaveBeenCalledWith(id);
    });

    it('should throw if id is not UUID', async () => {
      await expect(service.findById('bad-id')).rejects.toThrow(
        TokenErrorCode.INVALID_TOKEN,
      );
    });

    it('should throw if token not found by id', async () => {
      const id = uuidv4();
      tokenRepository.findById.mockResolvedValueOnce(null);

      await expect(service.findById(id)).rejects.toThrow(
        TokenErrorCode.TOKEN_NOT_FOUND,
      );
    });
  });

  it('should call remove with id', async () => {
    const id = uuidv4();
    await service.remove(id);
    expect(tokenRepository.remove).toHaveBeenCalledWith(id);
  });
});
