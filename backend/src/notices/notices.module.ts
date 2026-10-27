import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { AdminAuthModule } from "@/adminauth/adminauth.module";
import { NoticesController } from "./notices.controller";
import { AdminNoticesController } from "./adminnoticescontroller";
import { NoticesService } from "./notices.service";

@Module({
  imports: [PrismaModule, AdminAuthModule], // AdminModule must export AdminGuard + JwtModule
  controllers: [NoticesController, AdminNoticesController],
  providers: [NoticesService],
})
export class NoticesModule {}