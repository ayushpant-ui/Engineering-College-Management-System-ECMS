import { Injectable, NotFoundException } from "@nestjs/common";
import { NoticeCategory, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateNoticeDto } from "./dto/createnotice.dto";
import { UpdateNoticeDto } from "./dto/updatenotice.dto";

interface ListParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Public site: published notices only, pinned first ──
  findPublic() {
    return this.prisma.notice.findMany({
      where: { isPublished: true, publishedAt: { lte: new Date() } },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        attachmentUrl: true,
        isPinned: true,
        publishedAt: true,
      },
    });
  }

  // ── Admin: everything, with search / filter / pagination ──
  async list({ page, limit, search, category }: ListParams) {
    const validCategory = Object.values(NoticeCategory).includes(category as NoticeCategory)
      ? (category as NoticeCategory)
      : undefined;

    const where: Prisma.NoticeWhereInput = {
      ...(validCategory ? { category: validCategory } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { body: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.notice.findMany({
        where,
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notice.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  create(dto: CreateNoticeDto, adminId: number) {
    return this.prisma.notice.create({
      data: {
        title: dto.title.trim(),
        body: dto.body.trim(),
        category: dto.category ?? NoticeCategory.GENERAL,
        attachmentUrl: dto.attachmentUrl || null,
        isPinned: dto.isPinned ?? false,
        isPublished: dto.isPublished ?? true,
        createdById: adminId,
      },
    });
  }

  async update(id: number, dto: UpdateNoticeDto) {
    await this.ensureExists(id);

    const data: Prisma.NoticeUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.body !== undefined) data.body = dto.body.trim();
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.isPinned !== undefined) data.isPinned = dto.isPinned;
    if (dto.isPublished !== undefined) data.isPublished = dto.isPublished;
    if (dto.attachmentUrl !== undefined) data.attachmentUrl = dto.attachmentUrl || null; // "" removes it

    return this.prisma.notice.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.notice.delete({ where: { id } });
    return { message: "Notice deleted." };
  }

  private async ensureExists(id: number) {
    const found = await this.prisma.notice.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException("Notice not found.");
  }
}