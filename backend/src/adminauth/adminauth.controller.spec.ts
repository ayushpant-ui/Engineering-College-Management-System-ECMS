import { Test, TestingModule } from '@nestjs/testing';
import { AdminauthController } from './adminauth.controller';

describe('AdminauthController', () => {
  let controller: AdminauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminauthController],
    }).compile();

    controller = module.get<AdminauthController>(AdminauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
