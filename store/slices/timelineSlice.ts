import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TimelineState {
  currentTime: number;
  isPlaying: boolean;
  zoom: number; // px per second
  totalDuration: number;
}

const initialState: TimelineState = {
  currentTime: 0,
  isPlaying: false,
  zoom: 60,
  totalDuration: 10, // Start with a clean 10s default
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = Math.max(0, Math.min(action.payload, state.totalDuration));
    },
    setPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    togglePlayback(state) {
      state.isPlaying = !state.isPlaying;
    },
    setZoom(state, action: PayloadAction<number>) {
      state.zoom = Math.max(20, Math.min(200, action.payload));
    },
    setTotalDuration(state, action: PayloadAction<number>) {
      state.totalDuration = action.payload;
    },
    tickTime(state, action: PayloadAction<number>) {
      const nextTime = state.currentTime + action.payload;
      if (nextTime >= state.totalDuration) {
        state.currentTime = state.totalDuration;
        state.isPlaying = false;
      } else {
        state.currentTime = nextTime;
      }
    },
  },
});

export const {
  setCurrentTime, setPlaying, togglePlayback,
  setZoom, setTotalDuration, tickTime,
} = timelineSlice.actions;

export default timelineSlice.reducer;
