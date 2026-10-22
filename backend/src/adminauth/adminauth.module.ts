import { Module } from "@nestjs/common";
import { JwtModule, JwtSignOptions } from "@nestjs/jwt";
import { PrismaModule } from "../../prisma/prisma.module";
import { AdminAuthController } from "./adminauth.controller";
import { AdminStatsController } from "./admin-stats.controller";
import { AdminAuthService } from "./adminauth.service";
import { AdminGuard } from "./admin.guard";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_ADMIN_SECRET;
        if (!secret) throw new Error("JWT_ADMIN_SECRET is not set in .env");
        return {
          secret,
          signOptions: {
            expiresIn: (process.env.JWT_ADMIN_EXPIRES_IN ?? "30m") as JwtSignOptions["expiresIn"],
          },
        };
      },
    }),
    PrismaModule,
  ],
  controllers: [AdminAuthController, AdminStatsController],
  providers: [AdminAuthService, AdminGuard],
})

export class AdminAuthModule {}