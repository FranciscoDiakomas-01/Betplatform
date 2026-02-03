import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export default class PrimaService
  extends PrismaClient
  implements OnModuleDestroy, OnModuleInit
{
  private readonly logger = new Logger(PrimaService.name);
  constructor() {
    super({
      log: ['error', 'info', 'warn'],
    });
  }
  public async onModuleDestroy() {
    await this.$disconnect();
    this.logger.debug('Database Desconnected');
  }

  public async onModuleInit() {
    await this.$connect();
    this.logger.debug('Database Connected');
  }
}
