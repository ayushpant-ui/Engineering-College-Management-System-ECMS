import { Test, TestingModule } from '@nestjs/testing';
import { AcademicYearsController } from './academic-years.controller';

describe('AcademicYearsController', () => {
  let controller: AcademicYearsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicYearsController],
    }).compile();

    controller = module.get<AcademicYearsController>(AcademicYearsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
