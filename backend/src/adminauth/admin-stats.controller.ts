import { Controller, Get, UseGuards } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AdminGuard } from "./admin.guard";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminStatsController {
  constructor(private readonly prisma: PrismaService) {}

  // The dashboard shows a card for every number returned here.
  // Add more counts as you build more tables, e.g. faculty, notices.
  @Get("stats")
  async stats() {
    const [students, messages] = await Promise.all([
      this.prisma.student.count(), // <- change if your student model has another name
      this.prisma.contact.count(),
    ]);
    return { students, messages };
  }
}