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
          className="px-2.5 py-1 text-xs font-medium rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          {"\u78BA\u5B9A"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 text-xs font-medium rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
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
        className="p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
      >
        <EditIcon className={iconSize} />
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        title={"\u8907\u88FD"}
        className="p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
      >
        <DuplicateIcon className={iconSize} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title={"\u524A\u9664"}
        className="p-1.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        <DeleteIcon className={iconSize} />
      </button>
    </div>
  );
}
