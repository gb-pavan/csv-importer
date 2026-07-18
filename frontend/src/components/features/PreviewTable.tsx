"use client";

import { useCallback, useState } from "react";
import { Card } from "../ui/Card";

interface PreviewTableProps {
  headers: string[];
  data: Record<string, string>[];
}

const ROW_HEIGHT = 45;
const OVERSCAN = 8;

export const PreviewTable = ({ headers, data }: PreviewTableProps) => {
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  if (data.length === 0) return null;

  const visibleRowCount = Math.ceil(500 / ROW_HEIGHT);
  const firstVisibleRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const lastVisibleRow = Math.min(data.length, firstVisibleRow + visibleRowCount + OVERSCAN * 2);
  const visibleRows = data.slice(firstVisibleRow, lastVisibleRow);
  const topSpacerHeight = firstVisibleRow * ROW_HEIGHT;
  const bottomSpacerHeight = (data.length - lastVisibleRow) * ROW_HEIGHT;

  return (
    <Card className="flex h-full max-h-[min(500px,70vh)] flex-col overflow-hidden p-0 border-white/20">
      <div className="border-b border-white/10 bg-white/5 p-4 sm:px-6">
        <h3 className="text-lg font-semibold glow-text">CSV Data Preview</h3>
        <p className="text-xs text-slate-400">
          Viewing all {data.length.toLocaleString()} rows with virtualized rendering.
        </p>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar" onScroll={onScroll}>
        <table className="min-w-max w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white/10 backdrop-blur-md text-slate-300 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-medium tracking-wider sm:px-6 sm:py-4">#</th>
              {headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-4 py-3 font-medium tracking-wider sm:px-6 sm:py-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {topSpacerHeight > 0 && <tr aria-hidden="true"><td colSpan={headers.length + 1} style={{ height: topSpacerHeight }} /></tr>}
            {visibleRows.map((row, offset) => {
              const rowIndex = firstVisibleRow + offset;

              return (
                <tr key={rowIndex} className="h-[45px] hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-slate-500 sm:px-6">{rowIndex + 1}</td>
                  {headers.map((header) => (
                    <td key={header} className="whitespace-nowrap px-4 py-3 text-slate-300 sm:px-6">
                      {row[header] || "-"}
                    </td>
                  ))}
                </tr>
              );
            })}
            {bottomSpacerHeight > 0 && <tr aria-hidden="true"><td colSpan={headers.length + 1} style={{ height: bottomSpacerHeight }} /></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
