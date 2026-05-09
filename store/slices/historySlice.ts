import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HistoryEntry {
  timestamp: number;
  description: string;
  // We store a serialized snapshot
  snapshot: string;
}

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  canUndo: boolean;
  canRedo: boolean;
}

const initialState: HistoryState = {
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    pushHistory(state, action: PayloadAction<{ description: string; snapshot: string }>) {
      state.past.push({
        timestamp: Date.now(),
        description: action.payload.description,
        snapshot: action.payload.snapshot,
      });
      state.future = [];
      // Keep max 50 history entries
      if (state.past.length > 50) state.past.shift();
      state.canUndo = state.past.length > 0;
      state.canRedo = false;
    },
    undo(state) {
      if (state.past.length === 0) return;
      const last = state.past.pop()!;
      state.future.unshift(last);
      state.canUndo = state.past.length > 0;
      state.canRedo = true;
    },
    redo(state) {
      if (state.future.length === 0) return;
      const next = state.future.shift()!;
      state.past.push(next);
      state.canUndo = true;
      state.canRedo = state.future.length > 0;
    },
  },
});

export const { pushHistory, undo, redo } = historySlice.actions;
export default historySlice.reducer;
