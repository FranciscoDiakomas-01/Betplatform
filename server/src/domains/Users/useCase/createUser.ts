import PrimaService from '@/infra/database/Prisma/prisma.service';
import { IUseCase } from '@/types';
import { User } from '@prisma/client';
import { CreateUserDto } from '../dto/createUser.dto';
import { GetUserByPhoneUseCase } from './getUsers';
import { PhoneNumber } from '@/objectValues/Phone';
import { Password } from '@/objectValues/Password';
import { UserAlreadyExist } from '@/execptions/user.error';

export class CreateUser implements IUseCase<CreateUserDto, User> {
  private getterByPhone: GetUserByPhoneUseCase;
  constructor(private readonly repo: PrimaService) {
    this.getterByPhone = new GetUserByPhoneUseCase(this.repo);
  }
  public async handle(data: CreateUserDto): Promise<User> {
    const phone = new PhoneNumber(data.phone);
    const password = new Password().hash(data.password);
    const hasUser = await this.getterByPhone.handle(phone.getValue());
    if (hasUser) {
      throw new UserAlreadyExist();
    }
    const newUser = await this.repo.user.create({
      data: {
        ...data,
        password,
        phone: phone.getValue(),
      },
    });
    return newUser;
  }
}
