import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4, validate as isUuid } from 'uuid';
import { Token } from '../domain/token.domain';
import { TokenRepository } from '../domain/token.repository.interface';
import { TokenErrorCode } from '../constants/token.errors';

@Injectable()
export class TokenService {
  constructor(
    @Inject('TokenRepository')
    private readonly tokenRepository: TokenRepository,
  ) {}

  async create(): Promise<Token> {
    const value = uuidv4();
    return this.tokenRepository.create(value);
  }

  async findByValue(value: string): Promise<Token> {
    if (!isUuid(value)) {
      throw new Error(TokenErrorCode.INVALID_TOKEN);
    }

    const found = await this.tokenRepository.findByValue(value);
    if (!found) {
      throw new Error(TokenErrorCode.TOKEN_NOT_FOUND);
    }

    return found;
  }

  async remove(id: string): Promise<void> {
    await this.tokenRepository.remove(id);
  }
}
