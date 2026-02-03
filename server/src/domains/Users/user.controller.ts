import { Body, Controller, Get, Post, Put, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { VeriyUserDto } from './dto/verifyUser.dto';
import { CurrentUserId } from '@/decorators/userId.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo usuário e envia código de verificação',
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtém dados do usuário atual' })
  @ApiResponse({ status: 200, description: 'Dados do usuário atual' })
  async getMe(@CurrentUserId() userId: string) {
    return await this.userService.getById(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista usuários paginados' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return await this.userService.getAll(page, limit);
  }

  @Put()
  @ApiOperation({ summary: 'Atualiza um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  async update(@CurrentUserId() userId: string, @Body() dto: UpdateUserDto) {
    return await this.userService.update(userId, dto);
  }

  @Patch('toggle/:id')
  @ApiOperation({ summary: 'Ativa ou desativa um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário alternado' })
  async toggle(@CurrentUserId() userId: string) {
    return await this.userService.toogle(userId);
  }

  @Post('request-verification')
  @ApiOperation({ summary: 'Solicita novo código de verificação' })
  @ApiResponse({ status: 200, description: 'Código de verificação enviado' })
  async requestVerification(@CurrentUserId() userId: string) {
    return await this.userService.requestVerification(userId);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verifica o código enviado ao usuário' })
  @ApiResponse({ status: 200, description: 'Código verificado com sucesso' })
  async verify(@CurrentUserId() userId: string, @Body() dto: VeriyUserDto) {
    return await this.userService.verify(userId, dto);
  }
}
