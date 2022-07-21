import { Test, TestingModule } from '@nestjs/testing';
import { PostgreController } from './postgre.controller';

describe('PostgreController', () => {
  let controller: PostgreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostgreController],
    }).compile();

    controller = module.get<PostgreController>(PostgreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
