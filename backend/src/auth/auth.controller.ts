import { Controller, Post, Body, HttpStatus, HttpCode,UseGuards,Patch,Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/authlogin.dto';
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { ChangePasswordDto } from './dto/changepassworddto';
import { JwtAuthGuard } from './jwt-authguard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('student/login')
    @HttpCode(HttpStatus.OK)        
    async studentLogin(@Body() dto: AuthLoginDto) {
        return this.authService.studentLogin(dto);
    }

    @Patch('student/change-password')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async changeStudentPassword(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
    ) {
        return this.authService.changeStudentPassword(
        request.user.sub,
    dto,
    );
    }}
