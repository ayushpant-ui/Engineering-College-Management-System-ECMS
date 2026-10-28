import { Test, TestingModule } from '@nestjs/testing';
import { AdminstudentController } from './adminstudent.controller';

describe('AdminstudentController', () => {
  let controller: AdminstudentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminstudentController],
    }).compile();

    controller = module.get<AdminstudentController>(AdminstudentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
