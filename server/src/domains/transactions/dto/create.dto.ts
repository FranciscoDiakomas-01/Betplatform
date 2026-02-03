import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class TransactionDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  @IsPositive()
  amount: number;

  @ApiProperty({
    enum: TransactionType,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  operation: TransactionType;
}
