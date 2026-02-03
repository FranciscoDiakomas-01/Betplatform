import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUserId } from '@/decorators/userId.decorator';
import { SendMessageDto } from './chat.dto';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar ou pegar um chat do usuário' })
  async startChat(@CurrentUserId() userId: string) {
    return this.chatService.getOrCreateChat(userId);
  }

  @Get('my-chats')
  @ApiOperation({ summary: 'Listar todos os chats do usuário logado' })
  async getMyChats(@CurrentUserId() userId: string) {
    return this.chatService.getUserChats(userId);
  }

  @Post(':chatId/message')
  @ApiOperation({ summary: 'Enviar mensagem em um chat' })
  @ApiParam({ name: 'chatId', description: 'ID do chat' })
  @ApiBody({ type: SendMessageDto })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() body: SendMessageDto,
    @CurrentUserId() userId: string,
  ) {
    return this.chatService.sendMessage(chatId, userId, body.content);
  }

  @Post(':chatId/read')
  @ApiOperation({ summary: 'Marcar mensagens de um chat como lidas' })
  @ApiParam({ name: 'chatId', description: 'ID do chat' })
  async markAsRead(
    @Param('chatId') chatId: string,
    @CurrentUserId() userId: string,
  ) {
    await this.chatService.markAsRead(chatId, userId);
    return { success: true };
  }
}
