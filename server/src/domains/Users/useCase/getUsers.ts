import PrimaService from '@/infra/database/Prisma/prisma.service';
import { IPaginationInput, IPaginationOutPut, IUseCase } from '@/types';
import { User } from '@prisma/client';

export class GetUserByPhoneUseCase implements IUseCase<string, User | null> {
  constructor(private readonly repo: PrimaService) {}

  public async handle(input: string): Promise<User | null> {
    const UserWithPhone = await this.repo.user.findFirst({
      where: {
        phone: input,
      },
    });
    return UserWithPhone;
  }
}

export class GetUserByIdUseCase implements IUseCase<string, User | null> {
  constructor(private readonly repo: PrimaService) {}

  public async handle(input: string): Promise<User | null> {
    const user = await this.repo.user.findFirst({
      where: {
        id: input,
      },
    });
    return user;
  }
}

export class GetUsersUseCase implements IUseCase<
  IPaginationInput,
  IPaginationOutPut<Omit<User, 'password'>>
> {
  constructor(private readonly repo: PrimaService) {}

  public async handle(
    data: IPaginationInput,
  ): Promise<IPaginationOutPut<Omit<User, 'password'>>> {
    const { limit, page } = data;
    const offset = (page - 1) * limit;

    const [total, users] = await Promise.all([
      this.repo.user.count(),
      this.repo.user.findMany({
        take: limit,
        skip: offset,
      }),
    ]);
    const sanitizedUsers = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    const lastPage = Math.ceil(total / limit);
    return {
      items: sanitizedUsers,
      total,
      pagination: {
        page,
        limit,
        hasNextPage: page < lastPage,
        hasPrevPage: page > 1,
      },
    };
  }
}
