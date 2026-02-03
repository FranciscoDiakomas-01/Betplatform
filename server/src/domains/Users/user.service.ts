import PrimaService from '@/infra/database/Prisma/prisma.service';
import { SMSService } from '@/infra/SMS/sms.service';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { CreateUser } from './useCase/createUser';
import { JsonWebToken } from '@/lib/jwt';
import {
  RequestForVerification,
  VerifyUserPhoneUseCase,
} from './useCase/verifyUser';
import {
  GetUserByIdUseCase,
  GetUserByPhoneUseCase,
  GetUsersUseCase,
} from './useCase/getUsers';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UpdateUser } from './useCase/updateUser';
import { ToogleUser } from './useCase/toogleUser';
import { VeriyUserDto } from './dto/verifyUser.dto';
import { AuthDto } from './dto/auth.dto';
import { UserNotFound } from '@/execptions/user.error';
import { Password } from '@/objectValues/Password';

@Injectable()
export class UserService {
  constructor(
    private readonly repo: PrimaService,
    @Inject('ISMSService') private readonly smsService: SMSService,
  ) {}

  public async create(dto: CreateUserDto) {
    const createdUser = await new CreateUser(this.repo).handle(dto);
    const token = new JsonWebToken().sign({
      role: 'CLIENT',
      userId: createdUser.id,
    });
    await new RequestForVerification(this.repo, this.smsService).handle(
      createdUser.id,
    );
    return {
      token,
      data: {
        ...createdUser,
        password: '',
      },
      message: 'Foi lhe enviado um código de ativação',
    };
  }

  public async getById(id: string) {
    const data = await new GetUserByIdUseCase(this.repo).handle(id);
    return {
      data,
    };
  }

  public async getAll(page: number, limit: number) {
    const data = await new GetUsersUseCase(this.repo).handle({
      limit,
      page,
    });
    return {
      data,
    };
  }

  public async update(id: string, data: UpdateUserDto) {
    const updater = await new UpdateUser(this.repo).handle({
      data,
      id,
    });
    return {
      data: updater,
    };
  }

  public async toogle(id: string) {
    const toogled = await new ToogleUser(this.repo).handle(id);
    return {
      data: toogled,
    };
  }

  public async requestVerification(id: string) {
    const verification = await new RequestForVerification(
      this.repo,
      this.smsService,
    ).handle(id);

    return {
      data: verification,
    };
  }

  public async verify(id: string, data: VeriyUserDto) {
    const verification = await new VerifyUserPhoneUseCase(this.repo).handle({
      data,
      userId: id,
    });

    return {
      data: verification,
    };
  }

  public async login(data: AuthDto) {
    const passChecker = new Password();
    const user = await new GetUserByPhoneUseCase(this.repo).handle(data.phone);
    if (!user) {
      throw new UserNotFound();
    }
    const token = new JsonWebToken().sign({
      role: user.role,
      userId: user.id,
    });

    if (!passChecker.compare(user.password, data.password)) {
      throw new ForbiddenException({
        message: 'Senha ou telefone está incorecto',
      });
    }
    if (!user.isPhoneVerified) {
      await new RequestForVerification(this.repo, this.smsService).handle(
        user.id,
      );
    }
    return {
      token,
      data: {
        ...user,
        password: '',
      },
      message: !user.isPhoneVerified
        ? 'Foi lhe enviado um código de ativação'
        : 'Seja bem vindo',
    };
  }
}
