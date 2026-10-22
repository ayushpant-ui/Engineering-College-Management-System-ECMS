import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { AdminLoginDto } from "./dto/adminlogin.dto";

// Compared against when the email doesn't exist, so "unknown email" and
// "wrong password" take the same time and can't be told apart.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

@Injectable()
export class AdminAuthService{
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async login({ email, password }: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    const passwordOk = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);

    if (!admin || !admin.isActive || !passwordOk) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const accessToken = await this.jwt.signAsync({
      id: admin.id,
      email: admin.email,
      role: "admin",
    });

    return {
      message: "Login successful",
      accessToken,
      user: { id: admin.id, email: admin.email, fullName: admin.fullName, role: "admin" },
    };
  }
}