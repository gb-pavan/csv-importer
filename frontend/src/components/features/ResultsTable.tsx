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
  parsedLeads: Record<string, any>[];
}

export const ResultsTable = ({
  totalImported,
  totalSkipped,
  parsedLeads,
}: ResultsTableProps) => {
  console.log("Rendering ResultsTable with parsedLeads:", parsedLeads);

  // Extract all columns dynamically
  const columns =
    parsedLeads.length > 0
      ? Array.from(
          new Set(
            parsedLeads.flatMap((row) => Object.keys(row))
          )
        )
      : [];

  return (
    <div className="space-y-6 w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="flex items-center gap-4 bg-emerald-500/10 border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          <div>
            <p className="text-sm text-slate-300">
              Successfully Imported
            </p>
            <p className="text-3xl font-bold text-emerald-400">
              {totalImported}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-rose-500/10 border-rose-500/30">
          <XCircle className="w-10 h-10 text-rose-400" />
          <div>
            <p className="text-sm text-slate-300">
              Skipped (Invalid/Failed)
            </p>
            <p className="text-3xl font-bold text-rose-400">
              {totalSkipped}
            </p>
          </div>
        </Card>
      </div>

      {/* Dynamic Table */}
      <Card className="max-h-[500px] overflow-auto p-0 border-white/20 custom-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white/10 backdrop-blur-md text-slate-300 sticky top-0 z-10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-4 whitespace-nowrap"
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
                    className="px-6 py-3 text-slate-300 whitespace-nowrap"
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
    </div>
  );
};