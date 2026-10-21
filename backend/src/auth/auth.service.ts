import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/authlogin.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
   // Admin login with email. Only users with the ADMIN role can use this endpoint.
  async adminLogin({ email, password }: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return this.verifyAndIssue(user && user.role === Role.ADMIN ? user : null, password);
  }
 
  private async verifyAndIssue(
    user: User | null,
    password: string,
    profile: Record<string, unknown> = {}
  ) {
    // Same message for every failure so attackers can't tell which part was wrong.
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials.");
    }
 
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, role: user.role, ...profile },
    };
  }
}

