import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExist extends HttpException {
  constructor() {
    super(
      {
        message: 'Usuário com este dados já existe',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class UserNotFound extends HttpException {
  constructor() {
    super(
      {
        message: 'Usuário não encontrado',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}


export class UserNotVerfied extends HttpException {
  constructor() {
    super(
      {
        message: 'Usuário não verificado',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
