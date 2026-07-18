// "use client";

// import { Card } from "../ui/Card";
// import { CheckCircle2, XCircle } from "lucide-react";

// interface Lead {
//   name: string | null;
//   email: string | null;
//   crm_status: string | null;
//   data_source: string | null;
// }

// interface ResultsTableProps {
//   totalImported: number;
//   totalSkipped: number;
//   parsedLeads: Lead[];
// }

// export const ResultsTable = ({ totalImported, totalSkipped, parsedLeads }: ResultsTableProps) => {
//   console.log('Rendering ResultsTable with parsedLeads:', parsedLeads); // Debugging line
//   return (
//     <div className="space-y-6 w-full">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card className="flex items-center gap-4 bg-emerald-500/10 border-emerald-500/30">
//           <CheckCircle2 className="w-10 h-10 text-emerald-400" />
//           <div>
//             <p className="text-sm text-slate-300">Successfully Imported</p>
//             <p className="text-3xl font-bold text-emerald-400">{totalImported}</p>
//           </div>
//         </Card>
//         <Card className="flex items-center gap-4 bg-rose-500/10 border-rose-500/30">
//           <XCircle className="w-10 h-10 text-rose-400" />
//           <div>
//             <p className="text-sm text-slate-300">Skipped (Invalid/Failed)</p>
//             <p className="text-3xl font-bold text-rose-400">{totalSkipped}</p>
//           </div>
//         </Card>
//       </div>

//       <Card className="max-h-[500px] overflow-auto p-0 border-white/20 custom-scrollbar">
//         <table className="w-full text-sm text-left">
//           <thead className="text-xs uppercase bg-white/10 backdrop-blur-md text-slate-300 sticky top-0 z-10">
//             <tr>
//               <th className="px-6 py-4">Name</th>
//               <th className="px-6 py-4">Email</th>
//               <th className="px-6 py-4">Status</th>
//               <th className="px-6 py-4">Source</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-white/5">
//             {parsedLeads.map((lead, index) => (
//               <tr key={index} className="hover:bg-white/5 transition-colors">
//                 <td className="px-6 py-3 font-medium text-white">{lead.name || 'N/A'}</td>
//                 <td className="px-6 py-3 text-slate-300">{lead.email || 'N/A'}</td>
//                 <td className="px-6 py-3">
//                   <span className="px-2.5 py-1 rounded-full text-xs bg-white/10 text-cyan-300 border border-cyan-500/30">
//                     {lead.crm_status || 'NONE'}
//                   </span>
//                 </td>
//                 <td className="px-6 py-3 text-slate-400">{lead.data_source || 'N/A'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </Card>
//     </div>
//   );
// };

"use client";

import { Card } from "../ui/Card";
import { CheckCircle2, XCircle } from "lucide-react";

interface ResultsTableProps {
  totalImported: number;
  totalSkipped: number;
  batchesProcessed: number;
  parsedLeads: Record<string, unknown>[];
  skippedRecords: Record<string, unknown>[];
}

export const ResultsTable = ({
  totalImported,
  totalSkipped,
  batchesProcessed,
  parsedLeads,
  skippedRecords,
}: ResultsTableProps) => {
  // Extract all columns dynamically
  const columns =
    parsedLeads.length > 0
      ? Array.from(
          new Set(
            parsedLeads.flatMap((row) => Object.keys(row))
          )
        )
      : [];
  const skippedColumns = Array.from(
    new Set(skippedRecords.flatMap((record) => Object.keys(record)))
  ).filter((column) => column !== "sourceRow" && column !== "reason");

  return (
    <div className="space-y-6 w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        <Card className="flex items-center gap-3 border-cyan-500/30 bg-cyan-500/10 sm:gap-4">
          <CheckCircle2 className="h-9 w-9 shrink-0 text-cyan-400 sm:h-10 sm:w-10" />
          <div className="min-w-0">
            <p className="text-sm text-slate-300">Successfully Parsed</p>
            <p className="text-3xl font-bold text-cyan-400">{parsedLeads.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 border-emerald-500/30 bg-emerald-500/10 sm:gap-4">
          <CheckCircle2 className="h-9 w-9 shrink-0 text-emerald-400 sm:h-10 sm:w-10" />
          <div className="min-w-0">
            <p className="text-sm text-slate-300">
              Successfully Imported
            </p>
            <p className="text-3xl font-bold text-emerald-400">
              {totalImported}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3 border-rose-500/30 bg-rose-500/10 sm:gap-4">
          <XCircle className="h-9 w-9 shrink-0 text-rose-400 sm:h-10 sm:w-10" />
          <div className="min-w-0">
            <p className="text-sm text-slate-300">
              Skipped (Invalid/Failed)
            </p>
            <p className="text-3xl font-bold text-rose-400">
              {totalSkipped}
            </p>
          </div>
        </Card>
      </div>

      <p className="px-2 text-center text-sm leading-6 text-slate-400">
        AI processed this import in {batchesProcessed} batch{batchesProcessed === 1 ? "" : "es"}.
      </p>

      {/* Dynamic Table */}
      <Card className="max-h-[min(500px,70vh)] overflow-auto p-0 border-white/20 custom-scrollbar">
        {parsedLeads.length === 0 && (
          <p className="p-6 text-center text-slate-400">No valid CRM records were extracted.</p>
        )}
        <table className="min-w-max w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white/10 backdrop-blur-md text-slate-300 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4"
                >
                  {column.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {parsedLeads.map((lead, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-white/5 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column}`}
                    className="whitespace-nowrap px-4 py-3 text-slate-300 sm:px-6"
                  >
                    {lead[column] === null ||
                    lead[column] === undefined ||
                    lead[column] === ""
                      ? "N/A"
                      : String(lead[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {skippedRecords.length > 0 && (
        <Card className="max-h-[min(500px,70vh)] overflow-auto p-0 border-rose-500/30 custom-scrollbar">
          <div className="sticky top-0 z-10 border-b border-rose-500/20 bg-rose-500/10 px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="font-semibold text-rose-200">Skipped Records</h3>
            <p className="text-sm text-rose-200/70">These source rows could not be imported.</p>
          </div>
          <table className="min-w-max w-full text-sm text-left">
            <thead className="sticky top-[73px] z-10 bg-slate-950/90 text-xs uppercase text-slate-300">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">Source row</th>
                <th className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">Reason</th>
                {skippedColumns.map((column) => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">{column.replace(/_/g, " ")}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {skippedRecords.map((record, index) => (
                <tr key={`${record.sourceRow ?? "unknown"}-${index}`} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-slate-300 sm:px-6">{String(record.sourceRow ?? "N/A")}</td>
                  <td className="px-4 py-3 text-slate-300 sm:px-6">{String(record.reason ?? "Not imported")}</td>
                  {skippedColumns.map((column) => (
                    <td key={`${index}-${column}`} className="whitespace-nowrap px-4 py-3 text-slate-300 sm:px-6">
                      {record[column] === null || record[column] === undefined || record[column] === ""
                        ? "N/A"
                        : String(record[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
