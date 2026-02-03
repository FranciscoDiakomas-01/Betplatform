import PrimaService from '@/infra/database/Prisma/prisma.service';
import { GetUserByIdUseCase } from './getUsers';
import { IUseCase } from '@/types';
import { User } from '@prisma/client';
import { UserNotFound } from '@/execptions/user.error';
import { UpdateUserDto } from '../dto/updateUser.dto';

export interface IUpdateUserProps {
  id: string;
  data: UpdateUserDto;
}

export class UpdateUser implements IUseCase<
  IUpdateUserProps,
  Omit<User, 'password'>
> {
  private getter: GetUserByIdUseCase;
  constructor(private readonly repo: PrimaService) {
    this.getter = new GetUserByIdUseCase(this.repo);
  }

  public async handle(dto: IUpdateUserProps): Promise<Omit<User, 'password'>> {
    const { data, id } = dto;
    const user = await this.getter.handle(id);
    if (!user) {
      throw new UserNotFound();
    }
    const { password, ...rest } = user;
    await this.repo.user.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        phone: data.phone,
        isPhoneVerified : data.phone == user.phone ? user.isPhoneVerified : false
      },
    });
    return rest;
  }
}
