import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

const REG_NO = /^[A-Za-z0-9][A-Za-z0-9\-_/.]*$/;
const REG_NO_MESSAGE = "Registration number may only contain letters, numbers and - _ / .";

export class CreateStudentDto {
  @IsString() @MinLength(1) @MaxLength(120) 
  fullName!: string;

  @IsString() @MinLength(1) @MaxLength(30) @Matches(REG_NO, { message: REG_NO_MESSAGE })
  registrationNumber!: string;

  @IsInt() @Min(1) @Max(12) 
  semester!: number;

  @IsString() @MinLength(1) @MaxLength(100) 
  department!: string;
}


export class UpdateStudentDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) 
  fullName?: string;

  @IsOptional() @IsInt() @Min(1) @Max(12) 
  semester?: number;
  
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100) 
  department?: string;
}