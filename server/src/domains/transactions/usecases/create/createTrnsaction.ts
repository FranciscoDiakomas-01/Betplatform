import { IUseCase } from '@/types';
import { Transaction, TransactionType } from '@prisma/client';
import { TransactionDto } from '../../dto/create.dto';
import PrimaService from '@/infra/database/Prisma/prisma.service';
import { Deposit } from './strategies/deposit';
import { Debit } from './strategies/debit';

export interface ITrnsactionOperation {
  handle(data: { amount: number; userId: string }): Promise<Transaction>;
  verify(userId: string, amount: number): Promise<void>;
}

export class CreateTransaction implements IUseCase<
  {
    data: TransactionDto;
    userId: string;
  },
  Transaction
> {
  private strategiesMap: Record<TransactionType, ITrnsactionOperation>;
  constructor(private readonly repo: PrimaService) {
    
    this.strategiesMap = {
      DEPOSIT: new Deposit(this.repo),
      WITHDRAW: new Debit(this.repo),
    };
  }

  public async handle(input: {
    userId: string;
    data: TransactionDto;
  }): Promise<Transaction> {
    const { data, userId } = input;
    return this.strategiesMap[data.operation].handle({
      amount: data.amount,
      userId,
    });
  }
}
