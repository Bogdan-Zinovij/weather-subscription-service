import { Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate as isUuid } from 'uuid';
import { TokenRepository } from '../infrastructure/persistance/typeorm-token.repository';
import { Token } from '../domain/token.domain';

export class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenError';
  }
}

@Injectable()
export class TokenService {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async create(): Promise<Token> {
    const value = uuidv4();
    return this.tokenRepository.create(value);
  }

  async findByValue(value: string): Promise<Token> {
    if (!isUuid(value)) {
      throw new TokenError('INVALID_TOKEN');
    }

    const found = await this.tokenRepository.findByValue(value);
    if (!found) {
      throw new TokenError('TOKEN_NOT_FOUND');
    }

    return found;
  }

  async remove(id: string): Promise<void> {
    await this.tokenRepository.remove(id);
  }
}
