import { HttpException } from '@nestjs/common';

export class InvalidFormatDataExecption extends HttpException {
  constructor(data: { item: string; message: string }) {
    super(data, 400);
  }
}
