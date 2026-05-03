// ============================================================
// SpreadsheetEditor - Page container (delegates to useSheetData)
// ============================================================

import { useSheetData } from "../hooks/useSheetData";
import { DataTable } from "./DataTable";
import { ActionPanel } from "./ActionPanel";

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
    undo,
    redo,
    canUndo,
    canRedo,
  } = useSheetData();

  // ----------------------------------------------------------
  // Event handlers (thin wrappers)
  // ----------------------------------------------------------
  function handleDeleteRow(index: number) {
    deleteRow(index);
  }

  function handleDuplicateRow(index: number) {
    duplicateRow(index);
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
        <ActionPanel
          onSave={save}
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
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-500">Loading...</span>
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

      <footer className="w-full border-t border-gray-200 bg-white py-4 mt-auto">
        <div className="text-center text-xs text-gray-400">
          VOICEROID Sheet Editor
        </div>
      </footer>
    </div>
  );
}
