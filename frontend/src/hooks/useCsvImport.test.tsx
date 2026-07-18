import { act, renderHook, waitFor } from '@testing-library/react';
import Papa from 'papaparse';
import { useCsvImport } from './useCsvImport';

jest.mock('papaparse', () => ({
  __esModule: true,
  default: { parse: jest.fn() },
}));

const parse = Papa.parse as jest.Mock;

beforeEach(() => {
  parse.mockReset();
  jest.restoreAllMocks();
});

it('previews a valid CSV before upload', () => {
  parse.mockImplementation((_file, options) => {
    options.complete({
      meta: { fields: ['name', 'email'] },
      data: [{ name: 'Jane Doe', email: 'jane@example.com' }],
      errors: [],
    });
  });
  const { result } = renderHook(() => useCsvImport());

  act(() => result.current.handleFileSelection(new File(['name,email'], 'leads.csv', { type: 'text/csv' })));

  expect(result.current.status).toBe('previewing');
  expect(result.current.headers).toEqual(['name', 'email']);
  expect(result.current.previewData).toEqual([{ name: 'Jane Doe', email: 'jane@example.com' }]);
});

it('uploads the selected file and exposes the import results', async () => {
  parse.mockImplementation((_file, options) => {
    options.complete({ meta: { fields: ['email'] }, data: [{ email: 'jane@example.com' }], errors: [] });
  });
  const fetchMock = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
    totalImported: 1,
    totalSkipped: 0,
    batchesProcessed: 1,
    successfullyParsed: [{ email: 'jane@example.com' }],
      skippedRecords: [],
    }),
  });
  Object.defineProperty(global, 'fetch', { configurable: true, value: fetchMock });
  const { result } = renderHook(() => useCsvImport());

  act(() => result.current.handleFileSelection(new File(['email\njane@example.com'], 'leads.csv', { type: 'text/csv' })));
  await act(async () => result.current.confirmAndUpload());

  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/upload', expect.objectContaining({ method: 'POST' }));
  expect(result.current.results?.totalImported).toBe(1);
});
