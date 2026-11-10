import { PartialType } from '@nestjs/mapped-types';
import { CreateExamPeriodDto } from './create-exam-period.dto';

export class UpdateExamPeriodDto extends PartialType(CreateExamPeriodDto) {}