import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from '../entities/token.entity';
import { Token } from 'src/token/domain/token.domain';
import { TokenRepository } from 'src/token/domain/token.repository.interface';

@Injectable()
export class TypeOrmTokenRepository implements TokenRepository {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly repo: Repository<TokenEntity>,
  ) {}

  async create(value: string): Promise<Token> {
    const entity = this.repo.create({ value });
    const saved = await this.repo.save(entity);
    return new Token(saved.id, saved.value);
  }

  async findById(id: string): Promise<Token | null> {
    const found = await this.repo.findOne({ where: { id } });
    return found ? new Token(found.id, found.value) : null;
  }

  async findByValue(value: string): Promise<Token | null> {
    const found = await this.repo.findOne({ where: { value } });
    return found ? new Token(found.id, found.value) : null;
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
