import PrimaService from '@/infra/database/Prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Chat, Message } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrimaService) {}

  async getOrCreateChat(userId: string): Promise<Chat> {
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!admin) {
      throw new BadRequestException({
        message: 'Administrador não registrado',
      });
    }
    let chat = await this.prisma.chat.findUnique({
      where: { userId_adminId: { userId, adminId: admin.id } },
      include: { messages: true },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: { userId, adminId: admin.id },
        include: { messages: true },
      });
    }

    return chat;
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return this.prisma.chat.findMany({
      where: { userId },
      include: {
        messages: true,
        user: {
          select: {
            name: true,
            phone: true,
            id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    return this.prisma.message.create({
      data: { chatId, senderId, content },
    });
  }

  async markAsRead(chatId: string, userId: string): Promise<void> {
    await this.prisma.message.updateMany({
      where: { chatId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });
  }
}
