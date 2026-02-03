import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import DatabaseModule from './infra/database';
import { UserModule } from './domains/Users/user.module';
import AuthMiddleare from './middlewares/auth.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { MatchesModule } from './domains/matches/matches.module';
import { ChatModule } from './domains/chats/chat.module';
import { BetsModule } from './domains/bets/bets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate(config) {
        return config;
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 10,
          ttl: 60,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    MatchesModule,
    UserModule,
    BetsModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  private readonly loggger = new Logger(AppModule.name);
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleare)
      .exclude('auth')
      .exclude({
        path: '/users',
        method: RequestMethod.POST,
      })
      .forRoutes('*');
  }
}
