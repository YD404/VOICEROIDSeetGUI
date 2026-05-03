// ============================================================
// DataRow - Single row display and editing
// ============================================================

import { useState } from "react";
import type { DataRowProps, SheetRow } from "../types";
import { CustomSelect } from "./CustomSelect";
import { RowActions } from "./RowActions";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";
import { COL_DIALOGUE, COL_CUT, SELECT_COLUMNS } from "../constants";

export function DataRow({
  row,
  index,
  headers,
  speakerOptions,
  backgroundOptions,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddOption,
  isExpanded = false,
  onToggleExpand,
}: DataRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<SheetRow>({ ...row });

  const showMobileCompact = !isExpanded && !isEditing;
  const rowNumber = index + 1;

  function handleStartEdit() {
    setDraft({ ...row });
    setIsEditing(true);
    onToggleExpand?.(true); // Auto-expand on edit
  }

  function handleCancel() {
    setDraft({ ...row });
    setIsEditing(false);
  }

  function handleSave() {
    onUpdate(draft);
    setIsEditing(false);
  }

  function handleFieldChange(header: string, value: string) {
    setDraft((prev) => ({ ...prev, [header]: value }));
  }

  function getOptionsForColumn(header: string): string[] {
    const type = SELECT_COLUMNS[header];
    if (type === "speaker") return speakerOptions;
    if (type === "background") return backgroundOptions;
    return [];
  }

  // --- Render helpers ---

  const renderMobileCompact = () => (
    <td className={`md:hidden p-0 ${showMobileCompact ? "block" : "hidden"}`}>
      <div className="flex relative p-2 min-h-[70px]">
        {/* Left: Row number */}
        <div className="w-10 flex-shrink-0 flex items-center justify-center border-r border-gray-200 dark:border-gray-800 mr-2 transition-colors">
          <span className="text-xl font-bold text-gray-400 dark:text-gray-500 font-mono transition-colors">{rowNumber}</span>
        </div>

        {/* Center: Dialogue & Cut */}
        <div className="flex-grow flex flex-col justify-center pr-16 py-1">
          <div className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2 whitespace-pre-wrap break-words transition-colors">
            {row[COL_DIALOGUE] || <span className="text-gray-400 dark:text-gray-600 italic">（空）</span>}
          </div>
          {row[COL_CUT] && (
            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1 transition-colors">
              {row[COL_CUT]}
            </div>
          )}
        </div>

        {/* Top Right: Expand button */}
        <button
          type="button"
          onClick={() => onToggleExpand?.(true)}
          className="absolute top-1 right-1 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ChevronDownIcon className="w-5 h-5" />
        </button>

        {/* Bottom Right: Actions */}
        <div className="absolute bottom-1 right-1">
          <RowActions
            isEditing={false}
            onStartEdit={handleStartEdit}
            onCancel={handleCancel}
            onSave={handleSave}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </div>
      </div>
    </td>
  );

  const renderMobileExpandedHeader = () => (
    <td className={`md:hidden px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 justify-between items-center transition-colors ${!showMobileCompact ? "flex" : "hidden"}`}>
      <span className="font-mono text-sm font-bold text-gray-500 dark:text-gray-400 transition-colors">#{rowNumber}</span>
      {!isEditing && (
        <button
          type="button"
          onClick={() => onToggleExpand?.(false)}
          className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-xs hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          閉じる
          <ChevronUpIcon className="w-4 h-4" />
        </button>
      )}
    </td>
  );

  const renderCellContent = (header: string) => {
    const selectType = SELECT_COLUMNS[header];
    if (isEditing) {
      return selectType ? (
        <CustomSelect
          value={draft[header] ?? ""}
          options={getOptionsForColumn(header)}
          onChange={(v) => handleFieldChange(header, v)}
          onAddOption={(newOption) => onAddOption(header, newOption)}
          placeholder={`${header}`}
        />
      ) : (
        <textarea
          value={draft[header] ?? ""}
          onChange={(e) => handleFieldChange(header, e.target.value)}
          onInput={(e) => {
            const target = e.currentTarget;
            target.style.height = "auto";
            target.style.height = `${target.scrollHeight}px`;
          }}
          rows={1}
          className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 focus:outline-none transition-colors text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 resize-none overflow-hidden"
          style={{ minHeight: "32px" }}
        />
      );
    }
    return (
      <span className="text-sm block whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100 transition-colors">
        {row[header] ?? ""}
      </span>
    );
  };

  return (
    <tr
      className={`border-b border-gray-300 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex flex-col md:table-row mb-2 md:mb-0 border md:border-0 rounded-lg md:rounded-none overflow-hidden shadow-sm md:shadow-none relative ${
        isEditing ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"
      }`}
    >
      {renderMobileCompact()}
      {renderMobileExpandedHeader()}

      {/* Row number (PC) */}
      <td className="px-3 py-2 text-center text-xs text-gray-500 dark:text-gray-400 font-mono hidden md:table-cell transition-colors">
        {rowNumber}
      </td>

      {/* Columns */}
      {headers.map((header) => (
        <td
          key={header}
          className={`px-3 py-2 ${
            showMobileCompact ? "hidden" : "flex flex-col"
          } md:table-cell gap-1 border-b border-gray-100 dark:border-gray-800 md:border-none transition-colors`}
        >
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 md:hidden transition-colors">{header}</span>
          {renderCellContent(header)}
        </td>
      ))}

      {/* Actions (Expanded/PC) */}
      <td
        className={`px-3 py-2 justify-end md:table-cell bg-gray-50 dark:bg-gray-800/50 md:bg-transparent md:dark:bg-transparent mt-auto md:mt-0 transition-colors ${
          showMobileCompact ? "hidden" : "flex"
        }`}
      >
        <RowActions
          isEditing={isEditing}
          onStartEdit={handleStartEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          iconSize="w-4 h-4"
        />
      </td>
    </tr>
  );
}
