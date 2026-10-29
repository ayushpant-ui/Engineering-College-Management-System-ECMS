import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../adminauth/admin.guard";
import { AdminStudentsService } from "./adminstudent.service";
import { CreateStudentDto, UpdateStudentDto } from "./dto/student.dto";

type AdminRequest = { admin: { id: number } };

const toInt = (value: string | undefined, fallback?: number) => {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// Every route requires a valid ADMIN token.
@Controller("admin/students")
@UseGuards(AdminGuard)
export class AdminStudentController {
  constructor(private readonly studentsService: AdminStudentsService) {}

  @Get()
  list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("semester") semester?: string
  ) {
    return this.studentsService.list({
      page: toInt(page, 1)!,
      limit: Math.min(toInt(limit, 10)!, 50),
      search: search?.trim() || undefined,
      semester: toInt(semester),
    });
  }

  @Post()
  create(@Body() dto: CreateStudentDto, @Req() req: AdminRequest) {
    return this.studentsService.create(dto, req.admin.id);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Post(":id/reset-password")
  resetPassword(@Param("id", ParseIntPipe) id: number, @Req() req: AdminRequest) {
    return this.studentsService.resetPassword(id, req.admin.id);
  }

//   @Delete(":id")
//   remove(@Param("id", ParseIntPipe) id: number, @Req() req: AdminRequest) {
//     return this.studentsService.remove(id, req.admin.id);
//   }
}