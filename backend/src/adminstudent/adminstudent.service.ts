import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException
} from "@nestjs/common";

import type { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { randomInt } from "crypto";

import { PrismaService } from "../../prisma/prisma.service";
import { CreateStudentDto, UpdateStudentDto } from "./dto/student.dto";

const studentSelect = {
  id: true,
  fullName: true,
  registrationNumber: true,
  semester: true,
  department: true,
  account: {
    select: {
      mustChangePassword: true,
    },
  },
} satisfies Prisma.StudentSelect;

const ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function generateTemporaryPassword(length = 10): string {
  let password = "";

  do {
    password = Array.from(
      { length },
      () => ALPHABET[randomInt(ALPHABET.length)],
    ).join("");
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
      ...(semester !== undefined ? { semester } : {}),

      ...(search
        ? {
            OR: [
              {
                fullName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                registrationNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
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

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

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

          // Create the related account at the same time.
          account: {
            create: {
              passwordHash,
              mustChangePassword: true,
            },
          },
        },

        select: studentSelect,
      });

      this.logger.log(
        `Admin ${adminId} created student ${student.registrationNumber}`,
      );

      return {
        student,
        temporaryPassword,
      };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "A student with this registration number already exists.",
        );
      }

      throw error;
    }
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.ensureExists(id);

    return this.prisma.student.update({
      where: { id },

      data: {
        ...(dto.fullName !== undefined && {
          fullName: dto.fullName.trim(),
        }),

        ...(dto.semester !== undefined && {
          semester: dto.semester,
        }),

        ...(dto.department !== undefined &&
          this.departmentData(dto.department.trim())),
      },

      select: studentSelect,
    });
  }

  async resetPassword(id: number, adminId: number) {
    const student = await this.ensureExists(id);

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    // Update the related account, not the Student record.
    await this.prisma.student.update({
      where: { id },

      data: {
        account: {
          upsert: {
            create: {
              passwordHash,
              mustChangePassword: true,
            },

            update: {
              passwordHash,
              mustChangePassword: true,
            },
          },
        },
      },
    });

    this.logger.log(
      `Admin ${adminId} reset the password of student ${student.registrationNumber}`,
    );

    // Return the plain password only to the authorized admin.
    return { temporaryPassword };
  }

  private async ensureExists(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },

      select: {
        id: true,
        registrationNumber: true,
      },
    });

    if (!student) {
      throw new NotFoundException("Student not found.");
    }

    return student;
  }
}
//  async remove(id: number, adminId: number) {
//   const student = await this.ensureExists(id);

//   // Check whether the student has any result records.
//   const resultCount = await this.prisma.result.count({
//     where: { studentId: id },
//   });

//   if (resultCount > 0) {
//     throw new BadRequestException(
//       `This student has ${resultCount} result record${
//         resultCount === 1 ? "" : "s"
//       } and can't be deleted.`,
//     );
//   }

//   await this.prisma.student.delete({
//     where: { id },
//   });

//   this.logger.warn(
//     `Admin ${adminId} deleted student ${student.registrationNumber}`,
//   );

//   return { message: "Student deleted." };
// }
// }