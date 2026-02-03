import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VeriyUserDto {
  @ApiProperty({
    description: 'Código enviado por sms',
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
