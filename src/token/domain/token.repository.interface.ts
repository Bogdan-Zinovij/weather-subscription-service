import { Token } from './token.domain';

export interface TokenRepository {
  create(value: string): Promise<Token>;
  findById(id: string): Promise<Token | null>;
  findByValue(value: string): Promise<Token | null>;
  remove(id: string): Promise<void>;
}
