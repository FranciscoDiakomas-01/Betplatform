import PrimaService from '@/infra/database/Prisma/prisma.service';
import { IMathcApi } from '@/infra/Getaway';
import { IApiMatch } from '@/types';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GetAllGames, GetGameDetals } from './usecases/getMatches';

@Injectable()
export class MatchService implements OnModuleInit {
  private readonly logger = new Logger(MatchService.name);
  constructor(
    private readonly repo: PrimaService,
    @Inject('GAME_API_SERVICE') private readonly gameService: IMathcApi,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  private async syncGames() {
    const games = await this.gameService.getMatches();
    await this.createMany(games);
    this.logger.debug(games);
  }

  public async getGames(page: number, limit: number) {
    return await new GetAllGames(this.repo).handle({
      page,
      limit,
    });
  }

  public async getDetails(id: string) {
    return await new GetGameDetals(this.repo).handle(id);
  }

  async onModuleInit() {
    const games = await this.gameService.getMatches();
    this.logger.debug(games);
    await this.createMany(games);
  }

  private async createMany(games: IApiMatch[]) {
    for (const game of games) {
      await this.repo.match.upsert({
        create: {
          awayTeam: game.away_team,
          externId: game.id,
          homeTeam: game.home_team,
          key: game.sport_key,
          startAt: new Date(game.commence_time),
          completed: game.completed,
          scores: JSON.stringify(game?.scores),
          odds: {
            createMany: {
              data: {
                type: 'AWAY_WIN',
                value: '1.02.',
              },
            },
          },
        },

        update: {
          completed: game.completed,
          scores: JSON.stringify(game?.scores),
        },
        where: {
          externId: game.id,
        },
      });
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async CloseGames() {
    try {
      const ongoingGames = await this.repo.match.findMany({
        where: { completed: false },
      });

      for (const game of ongoingGames) {
        const gameEndTime = new Date(
          game.startAt.getTime() + 2 * 60 * 60 * 1000,
        );
        if (new Date() > gameEndTime) {
          await this.repo.match.update({
            where: { id: game.id },
            data: { completed: true, status: 'CLOSED' },
          });
          this.logger.debug(
            `Jogo ${game.homeTeam} vs ${game.awayTeam} fechado.`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Erro ao fechar jogos:', error);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  private async FinishedGames() {
    try {
      const ongoingGames = await this.repo.match.findMany({
        where: { completed: false },
      });

      for (const game of ongoingGames) {
        const gameEndTime = new Date(
          game.startAt.getTime() + 2 * 60 * 60 * 1000,
        );
        if (new Date() > gameEndTime) {
          await this.repo.match.update({
            where: { id: game.id },
            data: { completed: true, status: 'FINISHED' },
          });
          this.logger.debug(
            `Jogo ${game.homeTeam} vs ${game.awayTeam} fechado.`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Erro ao fechar jogos:', error);
    }
  }
}
