import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { MatchService } from './matches.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: MatchService) {}
  @Get()
  @ApiOperation({
    summary: 'Listagem todos jogos paginados de jogos ',
  })
  async getGames(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.gameService.getGames(page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalhes de um jogo',
  })
  async getDetails(@Param('id') id: string) {
    return this.gameService.getDetails(id);
  }
}
