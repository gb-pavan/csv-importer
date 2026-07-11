"use client";

import { Card } from "../ui/Card";

interface PreviewTableProps {
  headers: string[];
  data: Record<string, string>[];
}

export const PreviewTable = ({ headers, data }: PreviewTableProps) => {
  if (!data || data.length === 0) return null;

  return (
    <Card className="flex flex-col h-full max-h-[500px] p-0 overflow-hidden border-white/20">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="text-lg font-semibold glow-text">CSV Data Preview</h3>
        <p className="text-xs text-slate-400">Review your columns before AI extraction.</p>
      </div>
      
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white/10 backdrop-blur-md text-slate-300 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">#</th>
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-4 font-medium tracking-wider whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.slice(0, 50).map((row, rowIndex) => ( // Preview max 50 rows for performance
              <tr key={rowIndex} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-3 text-slate-500">{rowIndex + 1}</td>
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-6 py-3 whitespace-nowrap text-slate-300">
                    {row[header] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 50 && (
        <div className="p-3 text-center text-xs text-slate-400 bg-white/5 border-t border-white/10">
          Showing first 50 rows. {data.length - 50} more rows hidden.
        </div>
      )}
    </Card>
  );
};