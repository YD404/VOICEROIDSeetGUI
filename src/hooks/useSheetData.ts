// ============================================================
// useSheetData - Custom hook for sheet data management
// ============================================================

import { useState, useEffect, useCallback } from "react";
import type { SheetRow, ApiResponse } from "../types";
import { COL_NO, COL_BG, COL_SCENE, COL_SPEAKER } from "../constants";
import { useHistory } from "./useHistory";

// ----------------------------------------------------------
// Return type
// ----------------------------------------------------------
export interface UseSheetDataReturn {
  data: SheetRow[];
  headers: string[];
  speakerOptions: string[];
  backgroundOptions: string[];
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  updateRow: (index: number, updatedRow: SheetRow) => void;
  deleteRow: (index: number) => void;
  addRow: () => void;
  duplicateRow: (rowIndex: number) => void;
  updateOptions: (category: string, newValue: string) => void;
  save: () => Promise<void>;
  exportCsv: () => void;
  importCsv: (file: File) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// ----------------------------------------------------------
// Hook implementation
// ----------------------------------------------------------
export function useSheetData(): UseSheetDataReturn {
  // Use custom history hook for undo/redo
  const {
    state: data,
    commit: commitData,
    undo: undoHistory,
    redo: redoHistory,
    reset: resetHistory,
    canUndo,
    canRedo,
  } = useHistory<SheetRow[]>([]);

  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [speakerOptions, setSpeakerOptions] = useState<string[]>([]);
  const [backgroundOptions, setBackgroundOptions] = useState<string[]>([]);

  // ----------------------------------------------------------
  // Internal helpers
  // ----------------------------------------------------------
  function commitDataChange(updater: (prev: SheetRow[]) => SheetRow[]) {
    commitData(updater(data));
    setHasUnsavedChanges(true);
  }

  function handleUndo() {
    undoHistory();
    setHasUnsavedChanges(true);
  }

  function handleRedo() {
    redoHistory();
    setHasUnsavedChanges(true);
  }

  function extractOptions(rows: SheetRow[]) {
    const speakers = new Set<string>();
    const backgrounds = new Set<string>();
    for (const row of rows) {
      if (row[COL_SPEAKER]) speakers.add(row[COL_SPEAKER]);
      if (row[COL_BG]) backgrounds.add(row[COL_BG]);
    }
    setSpeakerOptions((prev) => {
      const merged = new Set([...prev, ...speakers]);
      return [...merged].filter(Boolean).sort();
    });
    setBackgroundOptions((prev) => {
      const merged = new Set([...prev, ...backgrounds]);
      return [...merged].filter(Boolean).sort();
    });
  }

  function reorderSequences(rows: SheetRow[]): SheetRow[] {
    let sceneCounter = 0;
    return rows.map((row, i) => {
      const newRow = { ...row };
      newRow[COL_NO] = String(i + 1);
      const sceneVal = row[COL_SCENE] != null ? String(row[COL_SCENE]) : "";
      if (sceneVal.trim() !== "") {
        sceneCounter++;
        newRow[COL_SCENE] = String(sceneCounter);
      }
      return newRow;
    });
  }

  // ----------------------------------------------------------
  // Data fetching
  // ----------------------------------------------------------
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sheet");
      const json: ApiResponse<SheetRow[]> = await res.json();
      if (json.status === "success" && json.data) {
        const dataWithIds = json.data.map((row) => ({
          ...row,
          _id: row._id || crypto.randomUUID(),
        }));
        resetHistory(dataWithIds);
        if (json.data.length > 0) {
          setHeaders(Object.keys(json.data[0]));
        }
        extractOptions(json.data);
        setHasUnsavedChanges(false);
      } else {
        setError(json.message ?? "Failed to fetch data");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  }, [resetHistory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----------------------------------------------------------
  // Row operations
  // ----------------------------------------------------------
  function updateRow(index: number, updatedRow: SheetRow) {
    commitDataChange((prev) => {
      const next = [...prev];
      next[index] = { ...updatedRow };
      return next;
    });
  }

  function deleteRow(index: number) {
    commitDataChange((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return reorderSequences(filtered);
    });
  }

  function addRow() {
    commitDataChange((prev) => {
      const emptyRow: SheetRow = { _id: crypto.randomUUID() };
      for (const h of headers) {
        emptyRow[h] = "";
      }
      const next = [...prev, emptyRow];
      return reorderSequences(next);
    });
  }

  function duplicateRow(rowIndex: number) {
    commitDataChange((prev) => {
      const targetRow = prev[rowIndex];
      if (!targetRow) return prev;
      const newRow = { ...targetRow, _id: crypto.randomUUID() };
      const before = prev.slice(0, rowIndex + 1);
      const after = prev.slice(rowIndex + 1);
      const result = [...before, newRow, ...after];
      return reorderSequences(result);
    });
  }

  // ----------------------------------------------------------
  // Option management
  // ----------------------------------------------------------
  function updateOptions(category: string, newValue: string) {
    if (!newValue || !newValue.trim()) return;
    const trimmed = newValue.trim();

    if (category === COL_SPEAKER) {
      setSpeakerOptions((prev) => {
        if (prev.includes(trimmed)) return prev;
        return [...prev, trimmed].sort();
      });
    } else if (category === COL_BG) {
      setBackgroundOptions((prev) => {
        if (prev.includes(trimmed)) return prev;
        return [...prev, trimmed].sort();
      });
    }
  }

  // ----------------------------------------------------------
  // Save (batch PUT)
  // ----------------------------------------------------------
  async function save() {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sheet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const json: ApiResponse = await res.json();
      if (json.status === "error") {
        throw new Error(json.message ?? "Save failed");
      }
      setHasUnsavedChanges(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save error");
    } finally {
      setIsSaving(false);
    }
  }

  // ----------------------------------------------------------
  // CSV Export (download to device)
  // ----------------------------------------------------------
  function escapeCsvField(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }

  function exportCsv() {
    // Exclude internal _id column
    const exportHeaders = headers.filter((h) => h !== "_id");
    const headerLine = exportHeaders.map(escapeCsvField).join(',');
    const rows = data.map((row) =>
      exportHeaders.map((h) => escapeCsvField(row[h] ?? '')).join(',')
    );
    const csvContent = [headerLine, ...rows].join('\n');
    // UTF-8 BOM for Excel compatibility
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    const ts = now.getFullYear().toString()
      + String(now.getMonth() + 1).padStart(2, '0')
      + String(now.getDate()).padStart(2, '0')
      + '_'
      + String(now.getHours()).padStart(2, '0')
      + String(now.getMinutes()).padStart(2, '0')
      + String(now.getSeconds()).padStart(2, '0');
    a.href = url;
    a.download = `voiceroid_sheet_${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ----------------------------------------------------------
  // CSV Import (load from device)
  // ----------------------------------------------------------
  function parseCsvLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          fields.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    fields.push(current);
    return fields;
  }

  function importCsv(file: File) {
    if (hasUnsavedChanges) {
      const ok = window.confirm(
        '未保存の変更があります。端末のCSVで上書きしますか？'
      );
      if (!ok) return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let text = e.target?.result as string;
        // Strip BOM if present
        if (text.charCodeAt(0) === 0xfeff) {
          text = text.slice(1);
        }
        const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
        if (lines.length < 2) {
          setError('CSVにデータ行がありません');
          return;
        }
        const csvHeaders = parseCsvLine(lines[0]);
        const rows: SheetRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvLine(lines[i]);
          const row: SheetRow = { _id: crypto.randomUUID() };
          csvHeaders.forEach((h, idx) => {
            row[h] = values[idx] ?? '';
          });
          rows.push(row);
        }
        // Update headers if they differ
        if (csvHeaders.length > 0) {
          setHeaders(csvHeaders);
        }
        resetHistory(rows);
        extractOptions(rows);
        setHasUnsavedChanges(true);
      } catch {
        setError('CSVの読み込みに失敗しました');
      }
    };
    reader.onerror = () => {
      setError('ファイルの読み込みに失敗しました');
    };
    reader.readAsText(file, 'UTF-8');
  }

  return {
    data,
    headers,
    speakerOptions,
    backgroundOptions,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    error,
    fetchData,
    updateRow,
    deleteRow,
    addRow,
    duplicateRow,
    updateOptions,
    save,
    exportCsv,
    importCsv,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
  };
}
