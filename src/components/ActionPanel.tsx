// ============================================================
// ActionPanel - Global action buttons
// ============================================================

import type { ActionPanelProps } from "../types";
import { UndoIcon, RedoIcon, PlusIcon, SaveIcon } from "./icons";

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
    <div className="flex items-center justify-between gap-4 px-5 py-3 w-full max-w-7xl mx-auto">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        {hasUnsavedChanges ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="hidden sm:inline">未保存の変更あり</span>
            <span className="sm:hidden">未保存</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span className="hidden sm:inline">保存済み</span>
            <span className="sm:hidden">保存済</span>
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
          title={"元に戻す"}
        >
          <UndoIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          title={"やり直す"}
        >
          <RedoIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 transition-colors shadow-sm"
          title={"行を追加"}
        >
          <PlusIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          title={"保存"}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SaveIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
