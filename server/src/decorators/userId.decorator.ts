import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request: Request = ctx.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'] as string;
    if (!userId) {
      throw new ForbiddenException('Usuário não permitido');
    }
    return userId;
  },
);
