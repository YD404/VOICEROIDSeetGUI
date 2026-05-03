// ============================================================
// CustomSelect - Select with add-new option
// ============================================================

import { useState, useRef, useEffect } from "react";
import type { CustomSelectProps } from "../types";

export function CustomSelect({
  value,
  options,
  onChange,
  onAddOption,
  placeholder = "Select...",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsAdding(false);
        setNewValue("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when adding
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  function handleSelect(opt: string) {
    onChange(opt);
    setIsOpen(false);
  }

  function handleAddSubmit() {
    const trimmed = newValue.trim();
    if (trimmed && !options.includes(trimmed)) {
      onAddOption(trimmed);
      onChange(trimmed);
    }
    setNewValue("");
    setIsAdding(false);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 text-left text-sm rounded border border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400 focus:border-gray-500 dark:focus:border-gray-400 focus:outline-none transition-colors truncate bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {value || <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-40 max-h-56 overflow-auto rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg transition-colors">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 ${opt === value ? "bg-gray-100 dark:bg-gray-700 font-medium" : ""}`}
            >
              {opt}
            </button>
          ))}

          {options.length > 0 && <hr className="border-gray-200 dark:border-gray-700 transition-colors" />}

          {isAdding ? (
            <div className="flex items-center gap-1 p-2">
              <input
                ref={inputRef}
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSubmit();
                  if (e.key === "Escape") {
                    setIsAdding(false);
                    setNewValue("");
                  }
                }}
                placeholder="New value"
                className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 focus:border-gray-500 dark:focus:border-gray-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddSubmit}
                className="px-2 py-1 text-xs rounded bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-white transition-colors font-medium"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              + Add new...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
