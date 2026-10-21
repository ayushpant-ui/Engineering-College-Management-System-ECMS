import { Controller, Post, Body, HttpStatus, HttpCode,UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/authlogin.dto';
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('student/login')
    @HttpCode(HttpStatus.OK)        
    async studentLogin(@Body() dto: AuthLoginDto) {
        return this.authService.studentLogin(dto);
    }

}
