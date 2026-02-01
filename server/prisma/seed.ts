import {Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Decimal } from '@prisma/client/runtime/library';
import 'dotenv/config';
import PrismaRepositorie from '../src/infra/database/Prisma/index';
import { Logger } from '@nestjs/common';

const prisma = PrismaRepositorie.getInstance();
const logger = new Logger('SEED');
async function createAdmin() {
  const email = process.env.ADMINEMAIL;
  const password = process.env.ADMINPASS;

  if (!email || !password) {
    throw new Error('ADMINEMAIL ou ADMINPASS não definidos no .env');
  }

  const adminExists = await prisma.tenants.findUnique({
    where: { email },
  });

  if (adminExists) {
    logger.debug('⚠️ Admin já existe. Seed ignorada.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.tenants.create({
    data: {
      title: 'PliqPay Admin',
      email,
      phone: '000000000',
      password: hashedPassword,
      role: Role.SUPERCOMPANIE,
      isActive: true,
      isVerified: true,
      totalErned: new Decimal(0),
      totalDisponible: new Decimal(0),
      totalErnedWithTax: new Decimal(0),
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
    await prisma.$disconnect();
  }
}

main();
