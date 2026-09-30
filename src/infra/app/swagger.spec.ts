import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OpenAPIObject } from '@nestjs/swagger';
import { AccountsController } from '../../domains/accounts/accounts.controller';
import { AccountsService } from '../../domains/accounts/accounts.service';
import { TransactionsController } from '../../domains/transactions/transactions.controller';
import { TransactionsService } from '../../domains/transactions/transactions.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { buildSwaggerDocument } from './swagger';

describe('buildSwaggerDocument', () => {
  let app: INestApplication;
  let document: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController, AccountsController, TransactionsController],
      providers: [
        AppService,
        { provide: AccountsService, useValue: {} },
        { provide: TransactionsService, useValue: {} },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    document = buildSwaggerDocument(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('uses the package name and version', () => {
    expect(document.info.title).toBe('cdx-interview');
    expect(document.info.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('documents exactly the three API endpoints', () => {
    const operations = Object.entries(document.paths).flatMap(
      ([path, item]) => Object.keys(item).map((method) => `${method} ${path}`),
    );

    expect(operations.sort()).toEqual([
      'get /accounts/{accountId}',
      'post /accounts',
      'post /transactions',
    ]);
  });

  it('documents the create account responses', () => {
    const operation = document.paths['/accounts'].post!;

    expect(operation.tags).toEqual(['accounts']);
    expect(Object.keys(operation.responses).sort()).toEqual([
      '201',
      '400',
      '409',
    ]);
  });

  it('documents the get account responses', () => {
    const operation = document.paths['/accounts/{accountId}'].get!;

    expect(operation.tags).toEqual(['accounts']);
    expect(Object.keys(operation.responses).sort()).toEqual([
      '200',
      '400',
      '404',
    ]);
  });

  it('documents the create transaction responses', () => {
    const operation = document.paths['/transactions'].post!;

    expect(operation.tags).toEqual(['transactions']);
    expect(Object.keys(operation.responses).sort()).toEqual([
      '201',
      '400',
      '404',
      '422',
    ]);
  });
});
