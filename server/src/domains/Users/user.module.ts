import { SmsHub } from '@/infra/SMS/strategies/smshub';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import AuthController from './auth.controller';

@Module({
  providers: [
    {
      provide: 'ISMSService',
      useClass: SmsHub,
    },
    UserService,
  ],
  exports: ['ISMSService'],
  controllers: [UserController, AuthController],
})
export class UserModule {}
