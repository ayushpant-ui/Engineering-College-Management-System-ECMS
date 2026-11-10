import { Test, TestingModule } from '@nestjs/testing';
import { CurriculaService } from './curricula.service';

describe('CurriculaService', () => {
  let service: CurriculaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurriculaService],
    }).compile();

    service = module.get<CurriculaService>(CurriculaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
