import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MediaResource, SidebarTab, MediaFilter } from '../../types/editor.types';

interface UIState {
  sidebarTab: SidebarTab;
  mediaFilter: MediaFilter;
  mediaSearch: string;
  resources: MediaResource[];
  zoom: number;
  canvasZoom: number;
  darkMode: boolean;
  sidebarOpen: boolean;
  isExportModalOpen: boolean;
}

const initialState: UIState = {
  sidebarTab: 'upload',
  mediaFilter: 'all',
  mediaSearch: '',
  resources: [],
  zoom: 60,
  canvasZoom: 0.6,
  darkMode: true,
  sidebarOpen: true,
  isExportModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setExportModalOpen(state, action: PayloadAction<boolean>) {
      state.isExportModalOpen = action.payload;
    },
    setSidebarTab(state, action: PayloadAction<SidebarTab>) {
      state.sidebarTab = action.payload;
    },
    setMediaFilter(state, action: PayloadAction<MediaFilter>) {
      state.mediaFilter = action.payload;
    },
    setMediaSearch(state, action: PayloadAction<string>) {
      state.mediaSearch = action.payload;
    },
    addResource(state, action: PayloadAction<MediaResource>) {
      state.resources.unshift(action.payload);
    },
    removeResource(state, action: PayloadAction<string>) {
      state.resources = state.resources.filter(r => r.id !== action.payload);
    },
    setCanvasZoom(state, action: PayloadAction<number>) {
      state.canvasZoom = Math.max(0.2, Math.min(2, action.payload));
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const {
  setSidebarTab, setMediaFilter, setMediaSearch,
  addResource, removeResource, setCanvasZoom, toggleDarkMode, toggleSidebar,
  setExportModalOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
