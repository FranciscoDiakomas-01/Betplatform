import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('Autenticação')
export default class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  @ApiOperation({
    summary: 'Login',
  })
  public async login(@Body() dto: AuthDto) {
    return await this.userService.login(dto);
  }
}
