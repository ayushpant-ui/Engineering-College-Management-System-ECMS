import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ExamScheduleDto } from './exam-schedule.dto';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  semester!: number;

  @IsNumber()
  @IsPositive()
  fee!: number;

  @IsNumber()
  @IsPositive()
  backPaperFee!: number;

  @IsDateString()
  formOpensAt!: string;

  @IsDateString()
  formClosesAt!: string;

  @IsDateString()
  examStartsAt!: string;

  @IsString()
  @IsNotEmpty()
  examCenter!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamScheduleDto)
  schedule!: ExamScheduleDto[];

  @IsInt()
  examPeriodId!: number;

  @IsString()
  @IsNotEmpty()
  examType!: string;
}