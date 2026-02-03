import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OddType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class PickDto {
  @ApiProperty({
    description: 'ID da partida',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @ApiProperty({
    description: 'Tipo de odd/aposta',
    enum: OddType,
    enumName: 'OddType',
    example: OddType.HOME_WIN,
    required: true,
  })
  @IsEnum(OddType)
  oddType: OddType;
}

export class CreateBetDto {
  @ApiProperty({
    description: 'Lista de palpites (máximo 2)',
    type: [PickDto],
    minItems: 1,
    maxItems: 2,
    example: [
      {
        matchId: '550e8400-e29b-41d4-a716-446655440000',
        oddType: OddType.HOME_WIN,
      },
      {
        matchId: '660e8400-e29b-41d4-a716-446655440001',
        oddType: OddType.AWAY_WIN,
      },
    ],
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickDto)
  picks: PickDto[];

  @ApiProperty({
    description: 'Valor apostado (stake)',
    example: 100.5,
    minimum: 1,
    required: true,
  })
  @IsNumber()
  @Min(1, { message: 'Valor mínimo de aposta é 1' })
  stake: number;
}
