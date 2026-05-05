// ============================================================
// ActionPanel - Global action buttons
// ============================================================

import { useState, useRef, useEffect } from "react";
import type { ActionPanelProps } from "../types";
import { UndoIcon, RedoIcon, PlusIcon, SaveIcon } from "./icons";

export function ActionPanel({
  onSave,
  onExportCsv,
  onAddRow,
  isSaving,
  hasUnsavedChanges,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ActionPanelProps) {
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!showSaveMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSaveMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSaveMenu]);

  function handleSaveClick() {
    if (isSaving || !hasUnsavedChanges) return;
    setShowSaveMenu((prev) => !prev);
  }

  function handleSaveToSheet() {
    setShowSaveMenu(false);
    onSave();
  }

  function handleSaveToDevice() {
    setShowSaveMenu(false);
    onExportCsv();
  }

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 w-full max-w-7xl mx-auto">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        {hasUnsavedChanges ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800/50 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="hidden sm:inline">未保存の変更あり</span>
            <span className="sm:hidden">未保存</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors">
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
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          title={"元に戻す"}
        >
          <UndoIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          title={"やり直す"}
        >
          <RedoIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 transition-colors"></div>

        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
          title={"行を追加"}
        >
          <PlusIcon className="w-4 h-4" />
        </button>

        {/* Save button with popover */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving || !hasUnsavedChanges}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            title={"保存"}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
            ) : (
              <SaveIcon className="w-4 h-4" />
            )}
          </button>

          {showSaveMenu && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
              <button
                type="button"
                onClick={handleSaveToSheet}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                スプシに保存
              </button>
              <div className="border-t border-gray-100 dark:border-gray-700"></div>
              <button
                type="button"
                onClick={handleSaveToDevice}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                端末に保存
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
