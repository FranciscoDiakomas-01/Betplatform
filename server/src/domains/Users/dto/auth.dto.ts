import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('AO')
  @ApiProperty({
    description: 'Telephone',
  })
  phone: string;
  @ApiProperty({
    description: 'Senha',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
