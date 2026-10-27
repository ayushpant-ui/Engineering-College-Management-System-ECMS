import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { AdminModule } from "../admin/adminmodule";
import { NoticesController } from "./notices.controller";
import { AdminNoticesController } from "./adminnoticescontroller";
import { NoticesService } from "./notices.service";

@Module({
  imports: [PrismaModule, AdminModule], // AdminModule must export AdminGuard + JwtModule
  controllers: [NoticesController, AdminNoticesController],
  providers: [NoticesService],
})
export class NoticesModule {}