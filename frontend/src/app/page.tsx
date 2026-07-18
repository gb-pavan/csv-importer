"use client";

import { CsvDropzone } from "@/components/features/CsvDropzone";
import { PreviewTable } from "@/components/features/PreviewTable";
import { ResultsTable } from "@/components/features/ResultsTable";
import { Button } from "@/components/ui/Button";
import { useCsvImport } from "@/hooks/useCsvImport";
import { Loader2, RefreshCcw } from "lucide-react";

export default function Home() {
  const { 
    status, headers, previewData, results, error, 
    handleFileSelection, handleFileRejection, confirmAndUpload, reset
  } = useCsvImport();

  return (
    <main className="min-h-screen p-8 md:p-24 max-w-6xl mx-auto flex flex-col gap-8">
      <header className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight glow-text">
          GrowEasy Data Importer
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Intelligently map and extract CRM leads from any CSV structure.
        </p>
      </header>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-center">
          {error}
        </div>
      )}

      {status === "idle" && (
        <div className="max-w-2xl mx-auto w-full">
          <CsvDropzone onFileSelected={handleFileSelection} onFileRejected={handleFileRejection} />
        </div>
      )}

      {status === "previewing" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PreviewTable headers={headers} data={previewData} />
          <div className="flex justify-end gap-4">
            <Button variant="ghost" onClick={reset}>Cancel</Button>
            <Button onClick={confirmAndUpload}>Confirm & Extract with AI</Button>
          </div>
        </div>
      )}

      {status === "uploading" && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6 glass-panel rounded-2xl">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white">AI is extracting records...</h3>
            <p className="text-slate-400 mt-2">This might take a moment depending on the file size.</p>
          </div>
        </div>
      )}

      {status === "success" && results && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <ResultsTable 
            totalImported={results.totalImported} 
            totalSkipped={results.totalSkipped} 
            parsedLeads={results.successfullyParsed} 
          />
          <div className="flex justify-center mt-8">
            <Button variant="secondary" onClick={reset}>
              <RefreshCcw className="w-4 h-4" /> Import Another File
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
