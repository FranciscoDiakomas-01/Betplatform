import { Global, Module } from '@nestjs/common';
import PrimaService from './Prisma/prisma.service';

@Global()
@Module({
  exports: [PrimaService],
  providers: [PrimaService],
})
export default class DatabaseModule {}
