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
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
  };
}
