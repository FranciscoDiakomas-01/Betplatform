import { IUseCase } from '@/types';
import { ITrnsactionOperation } from '../createTrnsaction';
import { Transaction } from '@prisma/client';
import PrimaService from '@/infra/database/Prisma/prisma.service';
import { UserNotFound, UserNotVerfied } from '@/execptions/user.error';
import { BadRequestException } from '@nestjs/common';

export class Deposit
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
        type: 'DEPOSIT',
        status: 'PENDING',
      },
    });
  }

  public async verify(userId: string, amount: number): Promise<void> {
    const user = await this.repo.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UserNotFound();
    }

    if (amount <= 0) {
      throw new BadRequestException({
        message: 'Saldo de deposito não pode ser inferior a zero',
      });
    }

    if (!user.isActive || user.isPhoneVerified) {
      throw new UserNotVerfied();
    }
  }
}
