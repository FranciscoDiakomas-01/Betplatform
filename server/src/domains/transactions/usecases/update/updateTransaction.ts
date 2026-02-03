import { Transaction } from '@prisma/client';

export type TransactionStateProp = {
  id: number;
  fileUrl: string;
  notes: string;
};

export interface ITransactionState<T> {
  update(input: T): Promise<Transaction>;
}
