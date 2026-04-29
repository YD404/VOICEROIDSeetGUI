import { useState, useCallback } from "react";

export function useHistory<T>(initialState: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialState);
  const [future, setFuture] = useState<T[]>([]);

  const commit = useCallback(
    (newPresent: T) => {
      setPast((p) => [...p, present]);
      setPresent(newPresent);
      setFuture([]);
    },
    [present]
  );

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(previous);
  }, [past, present, future]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setFuture(newFuture);
    setPast([...past, present]);
    setPresent(next);
  }, [past, present, future]);

  const reset = useCallback((newPresent: T) => {
    setPast([]);
    setPresent(newPresent);
    setFuture([]);
  }, []);

  return {
    state: present,
    past,
    future,
    commit,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
