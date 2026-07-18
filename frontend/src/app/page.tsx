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
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <header className="mx-auto mb-2 max-w-3xl space-y-3 text-center sm:mb-6 sm:space-y-4">
        <h1 className="text-3xl font-bold tracking-tight glow-text sm:text-5xl lg:text-6xl">
          GrowEasy Data Importer
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Intelligently map and extract CRM leads from any CSV structure.
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm leading-6 text-rose-300 sm:text-base">
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
            <Button variant="ghost" className="w-full sm:w-auto" onClick={reset}>Cancel</Button>
            <Button className="w-full sm:w-auto" onClick={confirmAndUpload}>Confirm & Extract with AI</Button>
          </div>
        </div>
      )}

      {status === "uploading" && (
        <div className="flex min-h-72 flex-col items-center justify-center space-y-5 rounded-2xl glass-panel px-6 py-12 text-center sm:min-h-96 sm:py-24">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white sm:text-xl">AI is extracting records...</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">This might take a moment depending on the file size.</p>
          </div>
        </div>
      )}

      {status === "success" && results && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <ResultsTable 
            totalImported={results.totalImported} 
            totalSkipped={results.totalSkipped} 
            batchesProcessed={results.batchesProcessed}
            parsedLeads={results.successfullyParsed} 
            skippedRecords={results.skippedRecords}
          />
          <div className="mt-8 flex justify-center">
            <Button className="w-full sm:w-auto" variant="secondary" onClick={reset}>
              <RefreshCcw className="w-4 h-4" /> Import Another File
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
