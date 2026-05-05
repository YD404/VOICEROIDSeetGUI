// ============================================================
// SpreadsheetEditor - Page container (delegates to useSheetData)
// ============================================================

import { useRef } from "react";
import { useSheetData } from "../hooks/useSheetData";
import { DataTable } from "./DataTable";
import { ActionPanel } from "./ActionPanel";
import { useTheme } from "../hooks/useTheme";

export function SpreadsheetEditor() {
  const {
    data,
    headers,
    speakerOptions,
    backgroundOptions,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    error,
    updateRow,
    deleteRow,
    addRow,
    duplicateRow,
    updateOptions,
    save,
    exportCsv,
    importCsv,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useSheetData();
  const { toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----------------------------------------------------------
  // Event handlers (thin wrappers)
  // ----------------------------------------------------------
  function handleDeleteRow(index: number) {
    deleteRow(index);
  }

  function handleDuplicateRow(index: number) {
    duplicateRow(index);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      importCsv(file);
    }
    // Reset so the same file can be selected again
    e.target.value = "";
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex flex-col transition-colors">
      <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm transition-colors">
        <ActionPanel
          onSave={save}
          onExportCsv={exportCsv}
          onAddRow={addRow}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </header>

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-6 space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-500 dark:border-gray-400 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-500 dark:text-gray-400">Loading...</span>
          </div>
        ) : (
          <DataTable
            data={data}
            headers={headers}
            speakerOptions={speakerOptions}
            backgroundOptions={backgroundOptions}
            onUpdateRow={updateRow}
            onDeleteRow={handleDeleteRow}
            onDuplicateRow={handleDuplicateRow}
            onAddOption={updateOptions}
          />
        )}
      </main>

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4 mt-auto transition-colors">
        <div className="text-center text-xs text-gray-400 flex flex-col items-center gap-2">
          <span>VOICEROID Sheet Editor</span>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline underline-offset-2 transition-colors cursor-pointer"
            >
              テーマを切り替える
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={handleImportClick}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline underline-offset-2 transition-colors cursor-pointer"
            >
              端末から上書き
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

