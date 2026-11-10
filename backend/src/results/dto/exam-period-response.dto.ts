export class ExamPeriodResponseDto {
  id!: number;

  name!: string;

  startsAt!: Date | null;

  endsAt!: Date | null;

  createdAt!: Date;
}