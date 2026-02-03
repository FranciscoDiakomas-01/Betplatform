import { PrismaClient, MatchStatus, OddType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  console.log('🧹 Limpando dados existentes...');

  // IMPORTANTE: Ordem correta para evitar constraints de chave estrangeira
  // Primeiro excluir as tabelas que dependem de outras

  // 1. Começar pelas tabelas mais dependentes
  await prisma.betPick.deleteMany();
  await prisma.betSlip.deleteMany();
  await prisma.odd.deleteMany();
  await prisma.match.deleteMany();
  await prisma.phoneVerification.deleteMany(); // Adicionado
  await prisma.transaction.deleteMany(); // Adicionado
  await prisma.message.deleteMany(); // Adicionado
  await prisma.chat.deleteMany(); // Adicionado
  await prisma.notification.deleteMany(); // Adicionado

  // 2. Agora deletar usuários (exceto se quiser manter algum)
  await prisma.user.deleteMany({
    where: { role: 'CLIENT' },
  });

  // Criar usuário admin
  const adminPhone = process.env.ADMIN_PHONE ?? '955555500';
  const adminExists = await prisma.user.findUnique({
    where: { phone: adminPhone },
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'Administrador',
        phone: adminPhone,
        password: bcrypt.hashSync(process.env.ADMIN_PASS ?? '1234567890', 10),
        role: 'ADMIN',
        balance: 100000,
        totalDisponible: 100000,
        isPhoneVerified: true,
      },
    });
    console.log('👑 Usuário admin criado');
  } else {
    console.log('👑 Usuário admin já existe');
  }

  // Criar usuários clientes
  const clients = [
    {
      name: 'João Silva',
      phone: '955555502',
      password: bcrypt.hashSync(process.env.ADMIN_PASS ?? '1234567890', 10),
      balance: 5000,
      totalDisponible: 5000,
    },
    {
      name: 'Maria Santos',
      phone: '955555503',
      password: bcrypt.hashSync(process.env.ADMIN_PASS ?? '1234567890', 10),
      balance: 3000,
      totalDisponible: 3000,
    },
    {
      name: 'Carlos Oliveira',
      phone: '955555504',
      password: bcrypt.hashSync(process.env.ADMIN_PASS ?? '1234567890', 10),
      balance: 7500,
      totalDisponible: 7500,
    },
  ];

  for (const client of clients) {
    const exists = await prisma.user.findUnique({
      where: { phone: client.phone },
    });

    if (!exists) {
      await prisma.user.create({
        data: {
          ...client,
          role: 'CLIENT',
          isPhoneVerified: true,
        },
      });
    }
  }
  console.log('👥 Usuários clientes criados');

  // Criar jogos
  const brazilianTeams = [
    'Flamengo',
    'Palmeiras',
    'Corinthians',
    'São Paulo',
    'Santos',
    'Grêmio',
    'Internacional',
    'Atlético-MG',
    'Cruzeiro',
    'Fluminense',
    'Botafogo',
    'Vasco',
    'Bahia',
    'Fortaleza',
    'Athletico-PR',
    'Ceará',
    'Sport',
    'Coritiba',
    'Goiás',
    'Atlético-GO',
  ];

  const internationalTeams = [
    'Real Madrid',
    'Barcelona',
    'Manchester United',
    'Manchester City',
    'Liverpool',
    'Chelsea',
    'Bayern Munich',
    'Borussia Dortmund',
    'Juventus',
    'Milan',
    'Inter',
    'PSG',
    'Ajax',
    'Porto',
    'Benfica',
  ];

  const matches: any[] = [];
  const now = new Date();

  console.log('⚽ Criando jogos...');

  for (let i = 0; i < 20; i++) {
    const startAt = new Date(now);
    startAt.setDate(startAt.getDate() + Math.floor(Math.random() * 7));
    startAt.setHours(16 + Math.floor(Math.random() * 8));
    startAt.setMinutes(0);
    startAt.setSeconds(0);

    const isBrazilianMatch = Math.random() > 0.5;
    const homeTeam = isBrazilianMatch
      ? brazilianTeams[Math.floor(Math.random() * brazilianTeams.length)]
      : internationalTeams[
          Math.floor(Math.random() * internationalTeams.length)
        ];

    let awayTeam;
    do {
      awayTeam = isBrazilianMatch
        ? brazilianTeams[Math.floor(Math.random() * brazilianTeams.length)]
        : internationalTeams[
            Math.floor(Math.random() * internationalTeams.length)
          ];
    } while (awayTeam === homeTeam);

    const matchKey = `${homeTeam.replace(/\s+/g, '_').toLowerCase()}_vs_${awayTeam.replace(/\s+/g, '_').toLowerCase()}_${startAt.getTime()}`;

    matches.push({
      externId: `EXT_${Date.now()}_${i}`,
      key: matchKey,
      homeTeam,
      awayTeam,
      startAt,
      status: i < 15 ? 'OPEN' : i < 18 ? 'CLOSED' : 'FINISHED',
      completed: i >= 18,
      scores:
        i >= 18
          ? [
              {
                period: '1T',
                home: Math.floor(Math.random() * 3),
                away: Math.floor(Math.random() * 3),
              },
              {
                period: '2T',
                home: Math.floor(Math.random() * 3),
                away: Math.floor(Math.random() * 3),
              },
              {
                period: 'FT',
                home: Math.floor(Math.random() * 5),
                away: Math.floor(Math.random() * 5),
              },
            ]
          : [],
    });
  }

  // Inserir jogos com transação para garantir atomicidade
  for (const matchData of matches) {
    try {
      const match = await prisma.match.create({
        data: {
          externId: matchData.externId,
          key: matchData.key,
          homeTeam: matchData.homeTeam,
          awayTeam: matchData.awayTeam,
          startAt: matchData.startAt,
          status: matchData.status as MatchStatus,
          completed: matchData.completed,
          scores: matchData.scores as any,
        },
      });

      const homeWinProb = 0.45 + Math.random() * 0.2;
      const drawProb = 0.25 + Math.random() * 0.1;
      const awayWinProb = 1 - (homeWinProb + drawProb);

      const homeWinOdd = new Decimal((1 / homeWinProb).toFixed(2));
      const drawOdd = new Decimal((1 / drawProb).toFixed(2));
      const awayWinOdd = new Decimal((1 / awayWinProb).toFixed(2));

      const odds = [
        { type: 'HOME_WIN' as OddType, value: homeWinOdd },
        { type: 'DRAW' as OddType, value: drawOdd },
        { type: 'AWAY_WIN' as OddType, value: awayWinOdd },
      ];

      for (const oddData of odds) {
        await prisma.odd.create({
          data: {
            matchId: match.id,
            type: oddData.type,
            value: oddData.value,
          },
        });
      }

      console.log(
        `✅ Jogo criado: ${match.homeTeam} vs ${match.awayTeam} - ${match.status}`,
      );
    } catch (error) {
      console.error(
        `❌ Erro ao criar jogo ${matchData.homeTeam} vs ${matchData.awayTeam}:`,
        error,
      );
    }
  }

  // Criar apostas de exemplo
  console.log('🎰 Criando apostas de exemplo...');

  const users = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    take: 2,
  });

  const openMatches = await prisma.match.findMany({
    where: { status: 'OPEN' },
    include: { odds: true },
    take: 5,
  });

  if (users.length > 0 && openMatches.length >= 2) {
    for (const user of users) {
      const numBets = 2 + Math.floor(Math.random() * 2); // 2-3 apostas por usuário

      for (let i = 0; i < numBets; i++) {
        try {
          const numPicks = Math.random() > 0.5 ? 1 : 2; // 1 ou 2 palpites
          const selectedMatches: string[] = [];
          const picksData: any[] = [];

          while (selectedMatches.length < numPicks) {
            const match =
              openMatches[Math.floor(Math.random() * openMatches.length)];
            if (!selectedMatches.includes(match.id)) {
              selectedMatches.push(match.id);
              const odd =
                match.odds[Math.floor(Math.random() * match.odds.length)];
              picksData.push({
                matchId: match.id,
                oddType: odd.type,
                oddValue: odd.value,
              });
            }
          }

          const stake = new Decimal((10 + Math.random() * 90).toFixed(2));
          let totalOdd = new Decimal(1);
          picksData.forEach((pick) => {
            totalOdd = totalOdd.times(pick.oddValue);
          });
          const possibleWin = stake.times(totalOdd);

          // Usar transação para garantir consistência
          await prisma.$transaction(async (tx) => {
            // Verificar saldo novamente
            const currentUser = await tx.user.findUnique({
              where: { id: user.id },
              select: { balance: true },
            });

            if (!currentUser || currentUser.balance.lessThan(stake)) {
              console.log(
                `⚠️ Saldo insuficiente para ${user.name}, pulando...`,
              );
              return;
            }

            const betSlip = await tx.betSlip.create({
              data: {
                userId: user.id,
                stake,
                totalOdd,
                possibleWin,
                status: 'PENDING',
                picks: {
                  create: picksData,
                },
              },
            });

            await tx.user.update({
              where: { id: user.id },
              data: {
                balance: { decrement: stake },
                totalDisponible: { decrement: stake },
              },
            });

            console.log(
              `🎰 Aposta criada para ${user.name}: R$ ${stake} - Odd: ${totalOdd}`,
            );
          });
        } catch (error) {
          console.error(`❌ Erro ao criar aposta para ${user.name}:`, error);
        }
      }
    }
  }

  console.log('✨ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
