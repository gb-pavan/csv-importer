"use client";

import React, { useCallback } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { UploadCloud, FileJson } from "lucide-react";
import { Card } from "../ui/Card";
import { cn } from "@/lib/utils";

interface CsvDropzoneProps {
  onFileSelected: (file: File) => void;
  onFileRejected: (message: string) => void;
}

export const CsvDropzone = ({ onFileSelected, onFileRejected }: CsvDropzoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0]);
    }
  }, [onFileSelected]);

  const onDropRejected = useCallback(() => {
    onFileRejected('Please choose one CSV file smaller than 10 MB.');
  }, [onFileRejected]);

  // Bypass the broken strict interface check by passing inline and casting
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  } as unknown as DropzoneOptions);

  return (
    <Card
      {...(getRootProps() as React.HTMLAttributes<HTMLDivElement>)}
      className={cn(
        "flex min-h-72 cursor-pointer flex-col items-center justify-center border-2 border-dashed px-5 py-10 text-center transition-all duration-300 focus:outline-none sm:min-h-80 sm:px-8 sm:py-16",
        isDragActive ? "border-emerald-500 bg-emerald-500/10 scale-[1.02]" : "border-white/20 hover:border-white/40 hover:bg-white/5",
        isDragReject && "border-red-500 bg-red-500/10"
      )}
    >
      <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
      
      <div className="mb-4 rounded-full bg-white/5 p-3 transition-colors sm:p-4">
        {isDragActive ? (
          <FileJson className="h-9 w-9 text-emerald-400 sm:h-10 sm:w-10" />
        ) : (
          <UploadCloud className="h-9 w-9 text-cyan-400 sm:h-10 sm:w-10" />
        )}
      </div>
      
      <h3 className="mb-2 text-lg font-semibold glow-text sm:text-xl">
        {isDragActive ? "Drop it right here" : "Upload your CSV"}
      </h3>
      <p className="mt-2 max-w-sm text-center text-sm leading-6 text-slate-400">
        Drag & drop your lead export here, or click to browse. Ensure it&apos;s a valid CSV format.
      </p>
    </Card>
  );
};
