import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const packageInfo = { name: 'test-app', version: '1.2.3' };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: { getVersion: vi.fn().mockReturnValue(packageInfo) },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the name and version from AppService', () => {
      expect(appController.getVersion()).toEqual(packageInfo);
    });
  });
});
