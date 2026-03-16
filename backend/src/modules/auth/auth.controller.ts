import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginSchema } from './dto/login.dto';
import { RegisterDto, RegisterSchema } from './dto/register.dto';
import { PayloadValidationGuard } from 'src/common/guards/payload-validation.guard';
import { PayloadValidation } from 'src/common/decorators/payload-validation.decorator';


@Controller('auth')
@UseGuards(PayloadValidationGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @PayloadValidation(RegisterSchema)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @PayloadValidation(LoginSchema)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }
}
