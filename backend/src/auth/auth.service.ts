import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/authlogin.dto';
import { ChangePasswordDto } from './dto/changepassworddto';
import { JwtAuthGuard } from './jwt-authguard';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private jwtAuthGuard: JwtAuthGuard,
  ) {}

  async studentLogin(dto: AuthLoginDto) {
    //finding student using registration number
    const student = await this.prisma.student.findUnique({
      where: {
        registrationNumber: dto.registrationNumber,
      },
      include: {
        account: true,
      },
    });

    //checking whether student registration number exists or not
    if (!student || !student.account) {
      throw new Error('Invalid registration number or password');
    }

    //comparing the frontend password with the hashed  password store in database
    const checkpassword = await bcrypt.compare(
      dto.password,
      student.account.passwordHash,
    );
    // if the password is incorrect
    if (!checkpassword) {
      throw new Error('Invalid registration number or password');
    }

    // creating JWT token payload
    const payload = {
      id: student.id,
      registrationNumber: student.registrationNumber,
      role: 'student',
    };
    // signing the payload to create a JWT token
    const accesstoken = this.jwtService.sign(payload);

    // returning the token and student info

    return {
      message: 'Login successfull',
      accesstoken,
      student: {
        id: student.id,
        registrationNumber: student.registrationNumber,
        fullName: student.fullName,
        department: student.department,
        semester: student.semester,
        mustChangePassword: student.account.mustChangePassword,
      },
    };
  }
  async changeStudentPassword(studentId: number, dto: ChangePasswordDto) {
    const account = await this.prisma.studentAccount.findUnique({
      where: {
        studentId,
      },
    });

    if (!account) {
      throw new UnauthorizedException('Student account not found.');
    }

    const currentPasswordMatches = await bcrypt.compare(
      dto.currentPassword,
      account.passwordHash,
    );

    if (!currentPasswordMatches) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const newPasswordIsSame = await bcrypt.compare(
      dto.newPassword,
      account.passwordHash,
    );

    if (newPasswordIsSame) {
      throw new BadRequestException(
        'Your new password must be different from your current password.',
      );
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.studentAccount.update({
      where: {
        studentId,
      },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });

    return {
      message: 'Password changed successfully.',
    };
  }
}
