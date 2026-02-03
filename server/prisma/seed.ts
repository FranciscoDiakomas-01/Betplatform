import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { Password } from '../src/objectValues/Password';
import { PrismaClient } from '@prisma/client';

const logger = new Logger('SEED');
async function createAdmin() {
  const phone = process.env.ADMINPHONE ?? '';
  const password = process.env.ADMINPASS ?? '';
  const prisma = new PrismaClient();

  prisma.user.upsert({
    create: {
      name: 'ADMIN WTT',
      password: new Password().hash(password),
      phone,
      role: 'ADMIN',
      isActive: true,
      isPhoneVerified: true,
    },
    update: {
      name: 'ADMIN WTT',
      password: new Password().hash(password),
      phone,
      role: 'ADMIN',
      isActive: true,
      isPhoneVerified: true,
    },
    where: {
      phone,
    },
  });
  logger.debug('✅ Admin criado com sucesso!');
}

async function main() {
  try {
    await createAdmin();
  } catch (error) {
    logger.error('❌ Erro ao rodar seed:', error);
  } finally {
  }
}

main();
