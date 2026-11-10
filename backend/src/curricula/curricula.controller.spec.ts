import { Test, TestingModule } from '@nestjs/testing';
import { CurriculaController } from './curricula.controller';

describe('CurriculaController', () => {
  let controller: CurriculaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurriculaController],
    }).compile();

    controller = module.get<CurriculaController>(CurriculaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
