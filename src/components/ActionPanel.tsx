// ============================================================
// ActionPanel - Global action buttons
// ============================================================

import type { ActionPanelProps } from "../types";
import { UndoIcon, RedoIcon } from "./icons";

export function ActionPanel({
  onSave,
  onAddRow,
  isSaving,
  hasUnsavedChanges,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ActionPanelProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        {hasUnsavedChanges ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            {"\u672A\u4FDD\u5B58\u306E\u5909\u66F4\u3042\u308A"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            {"\u4FDD\u5B58\u6E08\u307F"}
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          title={"\u5143\u306B\u623B\u3059"}
        >
          <UndoIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          title={"\u3084\u308A\u76F4\u3059"}
        >
          <RedoIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 transition-colors shadow-sm"
        >
          {"\uFF0B \u884C\u3092\u8FFD\u52A0"}
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isSaving ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58"}
        </button>
      </div>
    </div>
  );
}
