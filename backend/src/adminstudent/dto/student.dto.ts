import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

import { Type } from "class-transformer";

const REG_NO = /^[A-Za-z0-9][A-Za-z0-9\-_/.]*$/;

const REG_NO_MESSAGE =
  "Registration number may only contain letters, numbers and - _ / .";

// --------------------------------------------------
// Create Student DTO
// --------------------------------------------------

export class CreateStudentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(30)
  @Matches(REG_NO, { message: REG_NO_MESSAGE })
  registrationNumber!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  semester!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  admissionYearId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  departmentId!: number;
}

// --------------------------------------------------
// Update Student DTO
// --------------------------------------------------

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  semester?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  admissionYearId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  departmentId?: number;
}