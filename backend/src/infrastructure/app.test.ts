import { expect, it, jest } from '@jest/globals';
import request from 'supertest';
import type { ImportLeadsUseCase } from '../application/ImportLeadsUseCase.js';
import { createApp, type AppDependencies } from './app.js';

const importResult: Awaited<ReturnType<ImportLeadsUseCase['execute']>> = {
  totalImported: 1,
  totalSkipped: 0,
  batchesProcessed: 1,
  successfullyParsed: [],
  skippedRecords: [],
};

it('accepts a CSV upload and returns the import result', async () => {
  const parse = jest.fn<AppDependencies['parserService']['parse']>()
    .mockResolvedValue([{ name: 'Jane Doe', email: 'jane@example.com' }]);
  const execute = jest.fn<AppDependencies['importUseCase']['execute']>().mockResolvedValue(importResult);
  const app = createApp({ parserService: { parse }, importUseCase: { execute } });

  const response = await request(app)
    .post('/api/upload')
    .attach('csv_file', Buffer.from('name,email\nJane Doe,jane@example.com'), {
      filename: 'leads.csv',
      contentType: 'text/csv',
    });

  expect(response.status).toBe(200);
  expect(response.body).toEqual(importResult);
  expect(parse).toHaveBeenCalledWith('name,email\nJane Doe,jane@example.com');
  expect(execute).toHaveBeenCalledWith([{ name: 'Jane Doe', email: 'jane@example.com' }]);
});

it('rejects non-CSV uploads before parsing', async () => {
  const parse = jest.fn<AppDependencies['parserService']['parse']>();
  const execute = jest.fn<AppDependencies['importUseCase']['execute']>();
  const app = createApp({ parserService: { parse }, importUseCase: { execute } });

  const response = await request(app)
    .post('/api/upload')
    .attach('csv_file', Buffer.from('not a csv'), { filename: 'leads.txt' });

  expect(response.status).toBe(415);
  expect(response.body).toEqual({ error: 'Only CSV files are supported.' });
  expect(parse).not.toHaveBeenCalled();
  expect(execute).not.toHaveBeenCalled();
});
