import PrimaService from '@/infra/database/Prisma/prisma.service';
import { IPaginationInput, IPaginationOutPut, IUseCase } from '@/types';
import { Match } from '@prisma/client';

export class GetAllGames implements IUseCase<
  IPaginationInput,
  IPaginationOutPut<Match>
> {
  constructor(private readonly repo: PrimaService) {}

  public async handle(
    data: IPaginationInput,
  ): Promise<IPaginationOutPut<Match>> {
    const { limit, page } = data;
    const offset = (page - 1) * limit;
    const [total, games] = await Promise.all([
      this.repo.match.count(),
      this.repo.match.findMany({
        take: limit,
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
        skip: offset,
      }),
    ]);
    const lastPage = Math.ceil(total / limit);
    return {
      items: games,
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

export class GetGameDetals implements IUseCase<string, Match | null> {
  constructor(private readonly repo: PrimaService) {}
  public async handle(id: string): Promise<Match | null> {
    const game = await this.repo.match.findFirst({
      where: {
        id,
      },
      include: {
        odds: true,
      },
    });
    return game;
  }
}
