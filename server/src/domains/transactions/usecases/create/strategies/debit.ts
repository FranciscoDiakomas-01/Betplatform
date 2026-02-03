import { IUseCase } from '@/types';
import { ITrnsactionOperation } from '../createTrnsaction';
import PrimaService from '@/infra/database/Prisma/prisma.service';
import { Transaction } from '@prisma/client';
import { UserNotFound, UserNotVerfied } from '@/execptions/user.error';
import { BadRequestException } from '@nestjs/common';

export class Debit
  implements
    IUseCase<{ amount: number; userId: string }, Transaction>,
    ITrnsactionOperation
{
  constructor(private readonly repo: PrimaService) {}
  public async handle(input: {
    amount: number;
    userId: string;
  }): Promise<Transaction> {
    const { amount, userId } = input;
    await this.verify(userId, amount);
    return await this.repo.transaction.create({
      data: {
        amount,
        userId,
        type: 'WITHDRAW',
        status: 'PENDING',
      },
    });
  }

  public async verify(userId: string, amount: number): Promise<void> {
    const user = await this.repo.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        transactions: {
          where: {
            type: 'WITHDRAW',
          },
          take: 3,
          orderBy: [
            {
              createdAt: 'desc',
            },
          ],
        },
      },
    });

    if (!user) {
      throw new UserNotFound();
    }

    if (Number(user.totalDisponible) < amount) {
      throw new BadRequestException({
        message: 'Saldo insuficiente',
      });
    }

    const hasPendingsDebits = user.transactions.length > 0;

    if (hasPendingsDebits) {
      throw new BadRequestException({
        message:
          'Você só pode solicitar um novo saque apos a conclusão do anterior',
      });
    }

    if (!user.isActive || user.isPhoneVerified) {
      throw new UserNotVerfied();
    }
  }
}
