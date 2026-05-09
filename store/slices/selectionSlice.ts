import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectionState {
  selectedElementIds: string[];
  hoveredElementId: string | null;
}

const initialState: SelectionState = {
  selectedElementIds: [],
  hoveredElementId: null,
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    selectElement(state, action: PayloadAction<string>) {
      state.selectedElementIds = [action.payload];
    },
    multiSelectElement(state, action: PayloadAction<string>) {
      if (state.selectedElementIds.includes(action.payload)) {
        state.selectedElementIds = state.selectedElementIds.filter(id => id !== action.payload);
      } else {
        state.selectedElementIds.push(action.payload);
      }
    },
    clearSelection(state) {
      state.selectedElementIds = [];
    },
    setHovered(state, action: PayloadAction<string | null>) {
      state.hoveredElementId = action.payload;
    },
  },
});

export const { selectElement, multiSelectElement, clearSelection, setHovered } = selectionSlice.actions;
export default selectionSlice.reducer;
