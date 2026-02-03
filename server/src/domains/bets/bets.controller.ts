import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/bet.dto';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: any;
}

@ApiTags('bets')
@ApiBearerAuth()
@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova aposta' })
  @ApiBody({ type: CreateBetDto })
  @ApiCreatedResponse({
    description: 'Aposta criada com sucesso',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou saldo insuficiente',
  })
  @ApiForbiddenResponse({ description: 'Apenas clientes podem fazer apostas' })
  async create(
    @Body() createBetDto: CreateBetDto,
    @Req() req: RequestWithUser,
  ) {
    return await this.betsService.createBet(req.user.id, createBetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as apostas' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade por página',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Lista de apostas retornada com sucesso',
  })
  @ApiForbiddenResponse({ description: 'Acesso negado' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Req() req: RequestWithUser,
  ) {
    return await this.betsService.findAll(page, limit, req.user.id);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar minhas apostas' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade por página',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Lista das minhas apostas retornada com sucesso',
  })
  @ApiForbiddenResponse({
    description: 'Apenas clientes podem ver suas próprias apostas',
  })
  async getMyBets(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Req() req: RequestWithUser,
  ) {
    return await this.betsService.getUserBets(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma aposta pelo ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID da aposta',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({ description: 'Aposta retornada com sucesso' })
  @ApiNotFoundResponse({ description: 'Aposta não encontrada' })
  @ApiForbiddenResponse({
    description: 'Você não tem permissão para ver esta aposta',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ) {
    return await this.betsService.findOne(id, req.user);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Listar apostas de um usuário específico (Admin)' })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'UUID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade por página',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Apostas do usuário retornadas com sucesso',
  })
  @ApiForbiddenResponse({
    description: 'Apenas administradores podem ver apostas de outros usuários',
  })
  async getUserBets(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return await this.betsService.getUserBets(userId, page, limit);
  }
}
