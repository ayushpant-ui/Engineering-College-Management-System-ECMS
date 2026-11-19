import {
  IsDateString,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ExamScheduleDto {
  @IsString()
  @IsNotEmpty()
  subjectCode!: string;

  @IsString()
  @IsNotEmpty()
  subjectName!: string;

  @IsDateString()
  examDate!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;
}