import { useState, useCallback } from 'react';
import Papa from 'papaparse';

type ImportStatus = 'idle' | 'previewing' | 'uploading' | 'success' | 'error';

export const useCsvImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    setStatus('previewing');
    setError(null);

    // Parse just for the frontend preview
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(results.meta.fields || []);
        setPreviewData(results.data as any[]);
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
      // Assuming your backend is running on port 3001
      const response = await fetch('https://csv-importer-84qa.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('API processing failed.');

      const data = await response.json();
      setResults(data);
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during AI extraction.');
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