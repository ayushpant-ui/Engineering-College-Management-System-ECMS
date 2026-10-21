import { Test, TestingModule } from '@nestjs/testing';
import { AdminauthService } from './adminauth.service';

describe('AdminauthService', () => {
  let service: AdminauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminauthService],
    }).compile();

    service = module.get<AdminauthService>(AdminauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
