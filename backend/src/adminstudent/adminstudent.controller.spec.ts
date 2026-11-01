import { Test, TestingModule } from '@nestjs/testing';
import { AdminStudentController } from './adminstudent.controller';

describe('AdminstudentController', () => {
  let controller: AdminStudentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminStudentController],
    }).compile();

    controller = module.get<AdminStudentController>(AdminStudentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
