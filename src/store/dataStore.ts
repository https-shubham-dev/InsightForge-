import { create } from "zustand";

export type Row = Record<string, unknown>;

export interface QualityReport {
  originalRows: number;
  cleanedRows: number;
  columns: number;
  emptyRowsRemoved: number;
  duplicatesRemoved: number;
  fileName: string;
}

interface DataState {
  columns: string[];
  rows: Row[];
  report: QualityReport | null;
  setData: (columns: string[], rows: Row[], report: QualityReport) => void;
  clear: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  columns: [],
  rows: [],
  report: null,
  setData: (columns, rows, report) => set({ columns, rows, report }),
  clear: () => set({ columns: [], rows: [], report: null }),
}));

interface SettingsState {
  groqKey: string;
  geminiKey: string;
  setKeys: (groq: string, gemini: string) => void;
}

export const useSettingsStore = create<SettingsState>()(() => ({
  groqKey: import.meta.env.VITE_GROQ_API_KEY ?? "",
  geminiKey: "",
  setKeys: () => {},
}));
