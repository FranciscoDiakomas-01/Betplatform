import jwt from 'jsonwebtoken';

import { UserRole } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

export class JsonWebToken {
  private readonly secret = process.env.JWT_SECRET ?? '1234567890';

  public sign(data: { userId: string; role: UserRole }) {
    return jwt.sign(data, this.secret, {
      expiresIn: '14d',
    });
  }

  public verify<T>(token: string): T {
    try {
      return jwt.verify(token, this.secret) as T;
    } catch (error) {
      throw new ForbiddenException({
        message: 'Token inválido',
        error,
      });
    }
  }
}
