import { Controller, Get, UseGuards } from "@nestjs/common";

import { AdminGuard } from "../../adminauth/admin.guard";
import { PrismaService } from "../../../prisma/prisma.service";

@Controller("admin/academic-years")
@UseGuards(AdminGuard)
export class AdminAcademicYearsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.academicYear.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "desc",
      },
    });
  }
}