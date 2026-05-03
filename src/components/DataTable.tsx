// ============================================================
// DataTable - Table body
// ============================================================

import { useState } from "react";
import type { DataTableProps } from "../types";
import { DataRow } from "./DataRow";
import { NoDataIcon } from "./icons";

export function DataTable({
  data,
  headers,
  speakerOptions,
  backgroundOptions,
  onUpdateRow,
  onDeleteRow,
  onDuplicateRow,
  onAddOption,
}: DataTableProps) {
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <NoDataIcon className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No data</p>
        <p className="text-sm mt-1">Add a row to get started</p>
      </div>
    );
  }

  return (
    <div className="w-full md:rounded-xl md:border md:border-gray-200 md:bg-white md:shadow-sm">
      <table className="w-full text-left block md:table">
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
              #
            </th>
            {headers.map((header) => (
              <th key={header} className="px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {header}
              </th>
            ))}
            <th className="px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
              {"\u64CD\u4F5C"}
            </th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {data.map((row, i) => (
            <DataRow
              key={row._id ?? i}
              row={row}
              index={i}
              headers={headers}
              speakerOptions={speakerOptions}
              backgroundOptions={backgroundOptions}
              onUpdate={(updatedRow) => onUpdateRow(i, updatedRow)}
              onDelete={() => onDeleteRow(i)}
              onDuplicate={() => onDuplicateRow(i)}
              onAddOption={onAddOption}
              isExpanded={expandedRowIndex === i}
              onToggleExpand={(isExpanded) => setExpandedRowIndex(isExpanded ? i : null)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
