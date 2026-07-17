import { useState, useCallback } from 'react';
import Papa from 'papaparse';

type ImportStatus = 'idle' | 'previewing' | 'uploading' | 'success' | 'error';
type CsvRow = Record<string, string>;
type ImportResult = {
  totalImported: number;
  totalSkipped: number;
  successfullyParsed: Record<string, unknown>[];
};

export const useCsvImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<CsvRow[]>([]);
  const [results, setResults] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setStatus('previewing');
    setError(null);

    // Parse just for the frontend preview
    Papa.parse<CsvRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(results.meta.fields || []);
        setPreviewData(results.data);
      },
      error: (err) => {
        setError(`Failed to parse file: ${err.message}`);
        setStatus('error');
      }
    });
  }, []);

  const confirmAndUpload = useCallback(async () => {
    if (!file) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('csv_file', file); // Field name must match your backend Multer setup

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/upload';
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('API processing failed.');

      const data = await response.json() as ImportResult;
      setResults(data);
      setStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during AI extraction.');
      setStatus('error');
    }
  }, [file]);

  const reset = useCallback(() => {
    setFile(null);
    setStatus('idle');
    setHeaders([]);
    setPreviewData([]);
    setResults(null);
    setError(null);
  }, []);

  return {
    file, status, headers, previewData, results, error,
    handleFileSelection, confirmAndUpload, reset
  };
};
