import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'Conteúdo da mensagem enviada' })
  @IsString()
  @MinLength(1)
  content: string;
}
