// ============================================================
// RowActions - Action buttons for a single data row
// ============================================================

import { EditIcon, DuplicateIcon, DeleteIcon } from "./icons";

interface RowActionsProps {
  isEditing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  className?: string;
  iconSize?: string;
}

export function RowActions({
  isEditing,
  onStartEdit,
  onCancel,
  onSave,
  onDuplicate,
  onDelete,
  className = "",
  iconSize = "w-4 h-4",
}: RowActionsProps) {
  if (isEditing) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={onSave}
          className="px-2.5 py-1 text-xs font-medium rounded bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-white transition-colors"
        >
          {"\u78BA\u5B9A"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 text-xs font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {"\u53D6\u6D88"}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={onStartEdit}
        title={"\u7DE8\u96C6"}
        className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <EditIcon className={iconSize} />
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        title={"\u8907\u88FD"}
        className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <DuplicateIcon className={iconSize} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title={"\u524A\u9664"}
        className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
      >
        <DeleteIcon className={iconSize} />
      </button>
    </div>
  );
}
