import { IUseCase } from '@/types';
import { VeriyUserDto } from '../dto/verifyUser.dto';
import PrimaService from '@/infra/database/Prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { GetUserByIdUseCase } from './getUsers';
import { UserNotFound } from '@/execptions/user.error';
import { PhoneVerification } from '@prisma/client';
import { SMSService } from '@/infra/SMS/sms.service';
import { PhoneNumber } from '@/objectValues/Phone';

export interface IVerifyUserProps {
  data: VeriyUserDto;
  userId: string;
}

export interface IverifyUserReturn {
  message: string;
  verified: boolean;
}

export class VerifyUserPhoneUseCase implements IUseCase<
  IVerifyUserProps,
  IverifyUserReturn
> {
  constructor(private readonly repo: PrimaService) {}
  public async handle(dto: IVerifyUserProps): Promise<IverifyUserReturn> {
    const verification = await this.repo.phoneVerification.findFirst({
      where: {
        userId: dto.userId,
        code: dto.data.code,
      },
    });

    if (!verification) {
      throw new NotFoundException({
        message: 'Pedido de verificação não encontrado',
      });
    }

    if (verification.isUsed) {
      throw new ConflictException({
        message: 'Solicitação de verificação usada',
      });
    }

    await this.repo.phoneVerification.update({
      where: {
        userId: dto.userId,
      },
      data: {
        isUsed: true,
        user: {
          update: {
            isPhoneVerified: true,
          },
        },
      },
    });

    return {
      message: 'Perfil verificado',
      verified: true,
    };
  }
}

export class RequestForVerification implements IUseCase<
  string,
  PhoneVerification
> {
  private readonly getter: GetUserByIdUseCase;
  constructor(
    private readonly repo: PrimaService,
    private readonly smsService: SMSService,
  ) {
    this.getter = new GetUserByIdUseCase(this.repo);
  }
  public async handle(userId: string): Promise<PhoneVerification> {
    const user = await this.getter.handle(userId);
    const code = this.genCode();
    if (!user) {
      throw new UserNotFound();
    }

    if (user.isPhoneVerified) {
      throw new BadRequestException({
        message: 'Usuário já verificou seu celular',
      });
    }
    const verification = await this.repo.phoneVerification.upsert({
      where: {
        userId,
      },
      create: {
        code: code,
        userId,
        isUsed: false,
      },
      update: {
        code: code,
        isUsed: false,
        userId,
      },
    });
    await this.smsService.send(
      new PhoneNumber(user.phone),
      `Olá ${user.name} , Seu código de verificação é    ${code} `,
    );
    return verification;
  }

  private genCode() {
    return 'WTT_' + Math.floor(100000 + Math.random() * 900000).toString();
  }
}
