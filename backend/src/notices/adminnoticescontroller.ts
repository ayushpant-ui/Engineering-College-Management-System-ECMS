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
import { AdminGuard } from "@/adminauth/admin.guard";
import { NoticesService } from "./notices.service";
import { CreateNoticeDto } from "./dto/createnotice.dto";
import { UpdateNoticeDto } from "./dto/updatenotice.dto";

const toInt = (value: string | undefined, fallback: number) => {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// Every route here requires a valid ADMIN token.
@Controller("admin/notices")
@UseGuards(AdminGuard)
export class AdminNoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string,
    @Query("category") category?: string
  ) {
    return this.noticesService.list({
      page: toInt(page, 1),
      limit: Math.min(toInt(limit, 10), 50),
      search: search?.trim() || undefined,
      category,
    });
  }

  @Post()
  create(@Body() dto: CreateNoticeDto, @Req() req: { admin: { id: number } }) {
    return this.noticesService.create(dto, req.admin.id);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateNoticeDto) {
    return this.noticesService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.noticesService.remove(id);
  }
}