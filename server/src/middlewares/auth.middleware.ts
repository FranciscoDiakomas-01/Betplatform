import { ForbiddenException, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JsonWebToken } from '@/lib/jwt';

export default class AuthMiddleare implements NestMiddleware {
  private readonly jwt = new JsonWebToken();
  private readonly allowedOrigin = 'frontend';

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    const isProduction = false;
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    if (isProduction) {
      if (
        origin !== this.allowedOrigin &&
        !referer?.startsWith(this.allowedOrigin)
      ) {
        throw new ForbiddenException({
          message: 'Origem da requisição não permitida',
        });
      }

      const isHttps =
        req.secure || req.headers['x-forwarded-proto'] === 'https';
      if (!isHttps) {
        throw new ForbiddenException({
          message: 'https apenas',
        });
      }
    }

    if (!authHeader) {
      throw new ForbiddenException({
        message: 'authorization header não informado',
      });
    }
    const [type, token] = authHeader.split(' ');
    if (!token) {
      throw new ForbiddenException({
        message: 'Token não enviado',
      });
    }
    const decodedToken = this.jwt.verify<{
      userId: string;
      role: string;
    }>(token);

    req.headers['x-user-id'] = decodedToken?.userId;
    next();
    return;
  }
}
