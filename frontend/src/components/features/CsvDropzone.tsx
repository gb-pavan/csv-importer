"use client";

import React, { useCallback } from "react";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import { UploadCloud, FileJson } from "lucide-react";
import { Card } from "../ui/Card";
import { cn } from "@/lib/utils";

interface CsvDropzoneProps {
  onFileSelected: (file: File) => void;
}

export const CsvDropzone = ({ onFileSelected }: CsvDropzoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0]);
    }
  }, [onFileSelected]);

  // Bypass the broken strict interface check by passing inline and casting
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    multiple: false,
  } as unknown as DropzoneOptions);

  return (
    <Card
      {...(getRootProps() as React.HTMLAttributes<HTMLDivElement>)}
      className={cn(
        "border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center py-16 focus:outline-none",
        isDragActive ? "border-emerald-500 bg-emerald-500/10 scale-[1.02]" : "border-white/20 hover:border-white/40 hover:bg-white/5",
        isDragReject && "border-red-500 bg-red-500/10"
      )}
    >
      <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
      
      <div className="bg-white/5 p-4 rounded-full mb-4 transition-colors">
        {isDragActive ? (
          <FileJson className="w-10 h-10 text-emerald-400" />
        ) : (
          <UploadCloud className="w-10 h-10 text-cyan-400" />
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-2 glow-text">
        {isDragActive ? "Drop it right here" : "Upload your CSV"}
      </h3>
      <p className="text-slate-400 text-sm text-center max-w-sm mt-2">
        Drag & drop your lead export here, or click to browse. Ensure it&apos;s a valid CSV format.
      </p>
    </Card>
  );
};
