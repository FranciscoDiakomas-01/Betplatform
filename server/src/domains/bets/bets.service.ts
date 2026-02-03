import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateBetDto } from './dto/bet.dto';
import { UserRole, BetSlipStatus, MatchStatus, OddType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import PrimaService from '@/infra/database/Prisma/prisma.service';
import { UserNotFound } from '@/execptions/user.error';

@Injectable()
export class BetsService {
  constructor(private prisma: PrimaService) {}

  async createBet(userId: string, createBetDto: CreateBetDto) {
    const { picks, stake } = createBetDto;

    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.role != 'ADMIN') {
      throw new BadRequestException({
        message: 'Apenas clientes podem fazer apostas',
      });
    }

    const stakeDecimal = new Decimal(stake);

    if (user.balance.lessThan(stakeDecimal)) {
      throw new BadRequestException(
        'Saldo insuficiente para realizar a aposta',
      );
    }
    const matchIds = picks.map((pick) => pick.matchId);
    const matches = await this.prisma.match.findMany({
      where: {
        id: { in: matchIds },
        status: MatchStatus.OPEN,
      },
      include: {
        odds: true,
      },
    });

    if (matches.length !== picks.length) {
      throw new BadRequestException(
        'Uma ou mais partidas não estão disponíveis para apostas',
      );
    }

    let totalOdd = new Decimal(1);
    const betPicksData: any[] = [];

    for (const pick of picks) {
      const match = matches.find((m) => m.id === pick.matchId);
      if (!match) {
        return;
      }
      const odd = match.odds.find((o) => o.type === pick.oddType);

      if (!odd) {
        throw new BadRequestException(
          `Odd não encontrada para a partida ${match.homeTeam} vs ${match.awayTeam}`,
        );
      }

      totalOdd = totalOdd.times(odd.value);
      betPicksData.push({
        matchId: pick.matchId,
        oddType: pick.oddType,
        oddValue: odd.value,
      });
    }

    const possibleWin = stakeDecimal.times(totalOdd);

    return await this.prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: stakeDecimal },
          totalDisponible: { decrement: stakeDecimal },
        },
      });

      const betSlip = await prisma.betSlip.create({
        data: {
          userId,
          stake: stakeDecimal,
          totalOdd,
          possibleWin,
          status: BetSlipStatus.PENDING,
          picks: {
            create: betPicksData,
          },
        },
        include: {
          picks: {
            include: {
              match: {
                include: {
                  odds: true,
                },
              },
            },
          },
        },
      });

      return betSlip;
    });
  }

  async findAll(page: number, limit: number, currentUser: string) {
    const skip = (page - 1) * limit;
    const user = await this.prisma.user.findFirst({
      where: {
        id: currentUser,
      },
    });

    if (!user) {
      throw new UserNotFound();
    }
    let where: any = {};

    if (user.role === UserRole.CLIENT) {
      where.userId = user.id;
    }
    const [bets, total] = await Promise.all([
      this.prisma.betSlip.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          picks: {
            include: {
              match: {
                select: {
                  id: true,
                  homeTeam: true,
                  awayTeam: true,
                  startAt: true,
                  status: true,
                  completed: true,
                  scores: true,
                  odds: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.betSlip.count({ where }),
    ]);

    return {
      data: bets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, currentUser: any) {
    const bet = await this.prisma.betSlip.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        picks: {
          include: {
            match: {
              include: {
                odds: true,
              },
            },
          },
        },
      },
    });

    if (!bet) {
      throw new NotFoundException('Aposta não encontrada');
    }

    if (currentUser.role === UserRole.CLIENT && bet.userId !== currentUser.id) {
      throw new ForbiddenException(
        'Você não tem permissão para ver esta aposta',
      );
    }

    return bet;
  }

  async getUserBets(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }
    const [bets, total] = await Promise.all([
      this.prisma.betSlip.findMany({
        where,
        include: {
          picks: {
            include: {
              match: {
                select: {
                  id: true,
                  homeTeam: true,
                  awayTeam: true,
                  startAt: true,
                  status: true,
                  completed: true,
                  scores: true,
                  odds: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.betSlip.count({ where }),
    ]);

    return {
      data: bets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
