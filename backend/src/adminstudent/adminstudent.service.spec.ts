import { Test, TestingModule } from '@nestjs/testing';
import { AdminstudentService } from './adminstudent.service';

describe('AdminstudentService', () => {
  let service: AdminstudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminstudentService],
    }).compile();

    service = module.get<AdminstudentService>(AdminstudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
