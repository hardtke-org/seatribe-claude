import { useCallback, useSyncExternalStore } from 'react';
import type { AppData, Task, TaskStatus } from './types';
import { seed } from './seed';

const STORAGE_KEY = 'boat-check-data';

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed.clusters?.length && parsed.tasks?.length) return parsed;
    }
  } catch { /* ignore */ }
  return structuredClone(seed);
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let data = loadData();
let snapshot = data;
const listeners = new Set<() => void>();

function emit() {
  snapshot = { ...data };
  listeners.forEach(l => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): AppData {
  return snapshot;
}

export function useStore() {
  const store = useSyncExternalStore(subscribe, getSnapshot);

  const setTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      saveData(data);
      emit();
    }
  }, []);

  const setTaskNote = useCallback((taskId: string, note: string) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (task) {
      task.note = note || undefined;
      saveData(data);
      emit();
    }
  }, []);

  const resetToSeed = useCallback(() => {
    data = structuredClone(seed);
    saveData(data);
    emit();
  }, []);

  const importData = useCallback((imported: AppData) => {
    data = imported;
    saveData(data);
    emit();
  }, []);

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, []);

  return { store, setTaskStatus, setTaskNote, resetToSeed, importData, exportData };
}

export function getProgress(tasks: Task[]): { done: number; total: number; percent: number } {
  const relevant = tasks.filter(t => t.status !== 'skip');
  const done = relevant.filter(t => t.status === 'done').length;
  const total = relevant.length;
  return { done, total, percent: total === 0 ? 100 : Math.round((done / total) * 100) };
}
