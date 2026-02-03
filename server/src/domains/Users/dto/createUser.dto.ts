import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('AO')
  @ApiProperty({
    description: 'Telephone',
  })
  phone: string;
  @IsStrongPassword()
  @ApiProperty({
    description: 'Senha',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
