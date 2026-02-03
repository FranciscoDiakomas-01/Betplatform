import PrimaService from '@/infra/database/Prisma/prisma.service';
import { IPaginationOutPut, IUseCase } from '@/types';
import { Transaction, UserRole } from '@prisma/client';

export class GetTransactions implements IUseCase<
  {
    page: number;
    limit: number;
    userId: string;
    userRole: UserRole;
  },
  IPaginationOutPut<Transaction>
> {
  constructor(private readonly repo: PrimaService) {}

  public async handle(input: {
    page: number;
    limit: number;
    userId: string;
    userRole: UserRole;
  }): Promise<IPaginationOutPut<Transaction>> {
    const { page, limit, userId, userRole } = input;
    const isAdmin = userRole == 'ADMIN';
    const offset = (page - 1) * limit;

    const where = isAdmin
      ? {}
      : {
          userId,
        };
    const [total, transactions] = await Promise.all([
      this.repo.transaction.count({
        where,
      }),
      this.repo.transaction.findMany({
        where,
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
        take: limit,
        skip: offset,
      }),
    ]);
    const lastPage = Math.ceil(total / limit);
    return {
      items: transactions,
      pagination: {
        hasNextPage: page < lastPage,
        hasPrevPage: page > 1,
        limit,
        page,
      },
      total,
    };
  }
}

export class GetTransactionDetail implements IUseCase<
  {
    userId: string;
    userRole: UserRole;
    id: string;
  },
  Transaction | null
> {
  constructor(private readonly repo: PrimaService) {}

  public async handle(input: {
    userId: string;
    userRole: UserRole;
    id: string;
  }): Promise<Transaction | null> {
    const { id, userId, userRole } = input;
    const isAdmin = userRole == 'ADMIN';

    const where = isAdmin
      ? {
          id,
        }
      : {
          userId,
          id,
        };
    const transactions = await this.repo.transaction.findFirst({
      where,
    });
    return transactions;
  }
}
