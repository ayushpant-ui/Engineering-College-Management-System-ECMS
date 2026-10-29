import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateStudentDto, UpdateStudentDto } from "./dto/student.dto";

// `department: true` works whether department is a plain field or a relation.
const studentSelect = {
  id: true,
  fullName: true,
  registrationNumber: true,
  semester: true,
  department: true,
  mustChangePassword: true,
} satisfies Prisma.StudentSelect;

// No look-alike characters (0/O, 1/l/I) so it's easy to read out or copy
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function generateTemporaryPassword(length = 10) {
  let password = "";
  do {
    password = Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  } while (!/\d/.test(password) || !/[A-Za-z]/.test(password));
  return password;
}

interface ListParams {
  page: number;
  limit: number;
  search?: string;
  semester?: number;
}

@Injectable()
export class AdminStudentsService {
  private readonly logger = new Logger(AdminStudentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private departmentData(name: string) {
    return { department: name };
  }

  async list({ page, limit, search, semester }: ListParams) {
    const where: Prisma.StudentWhereInput = {
      ...(semester ? { semester } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { registrationNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        select: studentSelect,
        orderBy: { registrationNumber: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.student.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  // The plain temporary password is returned ONCE here and never stored.
  async create(dto: CreateStudentDto, adminId: number) {
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    try {
      const student = await this.prisma.student.create({
        data: {
          fullName: dto.fullName.trim(),
          registrationNumber: dto.registrationNumber.trim(),
          semester: dto.semester,
          ...this.departmentData(dto.department.trim()),
          passwordHash, 
          mustChangePassword: true,
        },
        select: studentSelect,
      });

      this.logger.log(`Admin ${adminId} created student ${student.registrationNumber}`);
      return { student, temporaryPassword };
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        throw new ConflictException("A student with this registration number already exists.");
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.ensureExists(id);

    return this.prisma.student.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName.trim() }),
        ...(dto.semester !== undefined && { semester: dto.semester }),
        ...(dto.department !== undefined && this.departmentData(dto.department.trim())),
      },
      select: studentSelect,
    });
  }

  async resetPassword(id: number, adminId: number) {
    const student = await this.ensureExists(id);

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    await this.prisma.student.update({
      where: { id },
      data: { passwordHash, mustChangePassword: true }, // ⚠ rename passwordHash if needed
    });

    this.logger.log(`Admin ${adminId} reset the password of student ${student.registrationNumber}`);
    return { temporaryPassword };
  }

//   async remove(id: number, adminId: number) {
//     const student = await this.ensureExists(id);

//     // Deleting a student would also delete their marks, so refuse.
//     const resultCount = await this.prisma.result.count({ where: { studentId: id } });
//     if (resultCount > 0) {
//       throw new BadRequestException(
//         `This student has ${resultCount} result record${resultCount === 1 ? "" : "s"} and can't be deleted.`
//       );
//     }

//     await this.prisma.student.delete({ where: { id } });
//     this.logger.warn(`Admin ${adminId} deleted student ${student.registrationNumber}`);
//     return { message: "Student deleted." };
//   }

//   private async ensureExists(id: number) {
//     const student = await this.prisma.student.findUnique({
//       where: { id },
//       select: { id: true, registrationNumber: true },
//     });
//     if (!student) throw new NotFoundException("Student not found.");
//     return student;
//   }
 }