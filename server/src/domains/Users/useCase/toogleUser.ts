import PrimaService from '@/infra/database/Prisma/prisma.service';
import { GetUserByIdUseCase } from './getUsers';
import { IUseCase } from '@/types';
import { User } from '@prisma/client';
import { UserNotFound } from '@/execptions/user.error';

export class ToogleUser implements IUseCase<string, Omit<User, 'password'>> {
  private getter: GetUserByIdUseCase;
  constructor(private readonly repo: PrimaService) {
    this.getter = new GetUserByIdUseCase(this.repo);
  }

  public async handle(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.getter.handle(userId);
    if (!user) {
      throw new UserNotFound();
    }
    const { password, ...rest } = user;

    await this.repo.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: !user.isActive,
      },
    });
    return rest;
  }
}
