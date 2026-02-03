import OddsApiService from '@/infra/Getaway/OddsApi';
import { Module } from '@nestjs/common';
import { MatchService } from './matches.service';
import { GameController } from './matches.controller';

@Module({
  providers: [
    {
      provide: 'GAME_API_SERVICE',
      useClass: OddsApiService,
    },
    MatchService,
  ],
  exports: [MatchService],
  controllers: [GameController],
})
export class MatchesModule {}
