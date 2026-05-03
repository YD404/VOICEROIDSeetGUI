// ============================================================
// Frontend type definitions
// ============================================================

/**
 * A single spreadsheet row. Keys are column header names.
 */
export type SheetRow = Record<string, string>;

/**
 * Unified API response type
 */
export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

/**
 * Props for DataTable
 */
export interface DataTableProps {
  data: SheetRow[];
  headers: string[];
  speakerOptions: string[];
  backgroundOptions: string[];
  onUpdateRow: (index: number, updatedRow: SheetRow) => void;
  onDeleteRow: (index: number) => void;
  onDuplicateRow: (index: number) => void;
  onAddOption: (category: string, newValue: string) => void;
}

/**
 * Props for DataRow
 */
export interface DataRowProps {
  row: SheetRow;
  index: number;
  headers: string[];
  speakerOptions: string[];
  backgroundOptions: string[];
  onUpdate: (updatedRow: SheetRow) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddOption: (category: string, newValue: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: (isExpanded: boolean) => void;
}

/**
 * Props for CustomSelect
 */
export interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (newValue: string) => void;
  onAddOption: (newOption: string) => void;
  placeholder?: string;
}

/**
 * Props for ActionPanel
 */
export interface ActionPanelProps {
  onSave: () => void;
  onAddRow: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
