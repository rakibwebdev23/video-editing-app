import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasElement, ElementAnimation } from '../../types/element.types';
import { FillMode } from '../../types/editor.types';

interface ElementsState {
  elements: CanvasElement[];
}

const initialState: ElementsState = {
  elements: [],
};

const elementsSlice = createSlice({
  name: 'elements',
  initialState,
  reducers: {
    addElement(state, action: PayloadAction<CanvasElement>) {
      state.elements.push(action.payload);
    },
    removeElement(state, action: PayloadAction<string>) {
      state.elements = state.elements.filter(e => e.id !== action.payload);
    },
    updateElementPosition(state, action: PayloadAction<{ id: string; x: number; y: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) { el.x = action.payload.x; el.y = action.payload.y; }
    },
    updateElementSize(state, action: PayloadAction<{ id: string; width: number; height: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) { el.width = action.payload.width; el.height = action.payload.height; }
    },
    updateElementFillMode(state, action: PayloadAction<{ id: string; fillMode: FillMode }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) el.fillMode = action.payload.fillMode;
    },
    updateElementDuration(state, action: PayloadAction<{ id: string; duration: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) el.duration = action.payload.duration;
    },
    updateElementFreePosition(state, action: PayloadAction<{ id: string; freePosition: boolean }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) el.freePosition = action.payload.freePosition;
    },
    updateElementXY(state, action: PayloadAction<{ id: string; x?: number; y?: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) {
        if (action.payload.x !== undefined) el.x = action.payload.x;
        if (action.payload.y !== undefined) el.y = action.payload.y;
      }
    },
    updateElementWidthHeight(state, action: PayloadAction<{ id: string; width?: number; height?: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) {
        if (action.payload.width !== undefined) el.width = action.payload.width;
        if (action.payload.height !== undefined) el.height = action.payload.height;
      }
    },
    addElementAnimation(state, action: PayloadAction<{ elementId: string; animation: ElementAnimation }>) {
      const el = state.elements.find(e => e.id === action.payload.elementId);
      if (el) el.animations.push(action.payload.animation);
    },
    removeElementAnimation(state, action: PayloadAction<{ elementId: string; animationId: string }>) {
      const el = state.elements.find(e => e.id === action.payload.elementId);
      if (el) el.animations = el.animations.filter(a => a.id !== action.payload.animationId);
    },
    updateElementAnimationDuration(
      state,
      action: PayloadAction<{ elementId: string; animationId: string; duration: number }>
    ) {
      const el = state.elements.find(e => e.id === action.payload.elementId);
      if (el) {
        const anim = el.animations.find(a => a.id === action.payload.animationId);
        if (anim) anim.duration = action.payload.duration;
      }
    },
    updateElementOpacity(state, action: PayloadAction<{ id: string; opacity: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) el.opacity = action.payload.opacity;
    },
    bringToFront(state, action: PayloadAction<string>) {
      const maxZ = Math.max(...state.elements.map(e => e.zIndex), 0);
      const el = state.elements.find(e => e.id === action.payload);
      if (el) el.zIndex = maxZ + 1;
    },
    sendToBack(state, action: PayloadAction<string>) {
      const minZ = Math.min(...state.elements.map(e => e.zIndex), 0);
      const el = state.elements.find(e => e.id === action.payload);
      if (el) el.zIndex = minZ - 1;
    },
    removePageElements(state, action: PayloadAction<string>) {
      state.elements = state.elements.filter(e => e.pageId !== action.payload);
    },
    updateElementVolume(state, action: PayloadAction<{ id: string; volume: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) el.volume = action.payload.volume;
    },
    updateElementFadeIn(state, action: PayloadAction<{ id: string; fadeIn: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) el.fadeIn = action.payload.fadeIn;
    },
    updateElementFadeOut(state, action: PayloadAction<{ id: string; fadeOut: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) el.fadeOut = action.payload.fadeOut;
    },
    updateElementStartTime(state, action: PayloadAction<{ id: string; startTime: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) el.startTime = Math.max(0, action.payload.startTime);
    },
    updateElementContent(state, action: PayloadAction<{ id: string; content: string }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) el.content = action.payload.content;
    },
    trimElement(state, action: PayloadAction<{ id: string; startTime: number; duration: number; startTimeOffset: number }>) {
      const el = state.elements.find(e => e.id === action.payload.id);
      if (el) {
        el.startTime = action.payload.startTime;
        el.duration = action.payload.duration;
        el.startTimeOffset = action.payload.startTimeOffset;
      }
    },
    splitElement(state, action: PayloadAction<{ id: string; splitTime: number }>) {
      const { id, splitTime } = action.payload;
      const elIdx = state.elements.findIndex(e => e.id === id);
      if (elIdx === -1) return;
      const el = state.elements[elIdx];

      // If split time is not inside the element, ignore
      if (splitTime <= el.startTime || splitTime >= el.startTime + el.duration) return;

      const originalStartTime = el.startTime;
      const originalDuration = el.duration;
      const originalOffset = el.startTimeOffset || 0;

      // Update original element
      const firstPartDuration = splitTime - originalStartTime;
      el.duration = firstPartDuration;

      // Create second part
      const secondPartDuration = originalDuration - firstPartDuration;
      const newElement: CanvasElement = {
        ...el,
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        startTime: splitTime,
        duration: secondPartDuration,
        startTimeOffset: originalOffset + firstPartDuration,
        zIndex: el.zIndex + 0.1, // slightly above
      };
      state.elements.push(newElement);
    },
  },
});

export const {
  addElement, removeElement,
  updateElementPosition, updateElementSize,
  updateElementFillMode, updateElementDuration,
  updateElementFreePosition, updateElementXY, updateElementWidthHeight,
  addElementAnimation, removeElementAnimation, updateElementAnimationDuration,
  updateElementOpacity, bringToFront, sendToBack, removePageElements,
  updateElementVolume, updateElementFadeIn, updateElementFadeOut,
  updateElementStartTime, updateElementContent, splitElement, trimElement,
} = elementsSlice.actions;

export default elementsSlice.reducer;
