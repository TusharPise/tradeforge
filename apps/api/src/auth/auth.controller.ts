import { Controller, Post, Get, Body, UsePipes, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RegisterDto, LoginDto, registerSchema, loginSchema } from '@tradeforge/validation';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  async verifyEmail(@Request() req: any) {
    return this.authService.verifyEmail(req.user.id);
  }

  @Post('kyc/verify')
  @UseGuards(JwtAuthGuard)
  async verifyKyc(@Request() req: any) {
    return this.authService.verifyKyc(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }
}
