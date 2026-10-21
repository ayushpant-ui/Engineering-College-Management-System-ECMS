import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { AdminAuthService } from "./adminauth.service";
import { AdminLoginDto } from "./dto/adminlogin.dto";

@Controller("auth/admin")
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  // Max 5 attempts per minute per IP to slow down password guessing.
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AdminLoginDto) {
    return this.authService.login(dto);
  }
}