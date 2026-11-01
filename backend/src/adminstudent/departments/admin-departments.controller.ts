import { Controller, Get, UseGuards } from "@nestjs/common";

import { AdminGuard } from "../../adminauth/admin.guard";
import { PrismaService } from "../../../prisma/prisma.service";

@Controller("admin/departments")
@UseGuards(AdminGuard)
export class AdminDepartmentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.department.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}