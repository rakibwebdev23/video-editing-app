import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Page, LayoutType, PageAnimation, PageTransition } from '../../types/editor.types';

const PAGE_COLORS = ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899'];

const defaultPage: Page = {
  id: 'page-1',
  name: 'Page 1',
  layout: 'single',
  backgroundColor: '#FCFAFF',
  duration: 10,
  transition: { name: 'none', duration: 1.5 } as PageTransition,
  animations: [],
  elementIds: [],
  color: PAGE_COLORS[0],
};

interface PagesState {
  pages: Page[];
  activePageId: string;
}

const initialState: PagesState = {
  pages: [defaultPage],
  activePageId: 'page-1',
};

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    addPage(state) {
      const idx = state.pages.length;
      const newPage: Page = {
        id: `page-${Date.now()}`,
        name: `Page ${idx + 1}`,
        layout: 'single',
        backgroundColor: '#FCFAFF',
        duration: 10,
        transition: { name: 'none', duration: 1.5 } as PageTransition,
        animations: [],
        elementIds: [],
        color: PAGE_COLORS[idx % PAGE_COLORS.length],
      };
      state.pages.push(newPage);
      state.activePageId = newPage.id;
    },
    deletePage(state, action: PayloadAction<string>) {
      if (state.pages.length <= 1) return;
      const idx = state.pages.findIndex(p => p.id === action.payload);
      state.pages.splice(idx, 1);
      if (state.activePageId === action.payload) {
        state.activePageId = state.pages[Math.max(0, idx - 1)].id;
      }
    },
    setActivePage(state, action: PayloadAction<string>) {
      state.activePageId = action.payload;
    },
    updatePageLayout(state, action: PayloadAction<{ pageId: string; layout: LayoutType }>) {
      const page = state.pages.find(p => p.id === action.payload.pageId);
      if (page) page.layout = action.payload.layout;
    },
    updatePageBackground(state, action: PayloadAction<{ pageId: string; color: string }>) {
      const page = state.pages.find(p => p.id === action.payload.pageId);
      if (page) page.backgroundColor = action.payload.color;
    },
    updatePageDuration(state, action: PayloadAction<{ pageId: string; duration: number }>) {
      const page = state.pages.find(p => p.id === action.payload.pageId);
      if (page) page.duration = action.payload.duration;
    },
    addPageAnimation(state, action: PayloadAction<{ pageId: string; animation: PageAnimation }>) {
      const page = state.pages.find(p => p.id === action.payload.pageId);
      if (page) page.animations.push(action.payload.animation);
    },
    removePageAnimation(state, action: PayloadAction<{ pageId: string; animationId: string }>) {
      const page = state.pages.find(p => p.id === action.payload.pageId);
      if (page) {
        page.animations = page.animations.filter(a => a.id !== action.payload.animationId);
      }
    },
    updatePageAnimationDuration(state, action: PayloadAction<{ pageId: string; animationId: string; duration: number }>) {
      const page = state.pages.find(p => p.id === action.payload.pageId);
      if (page) {
        const anim = page.animations.find(a => a.id === action.payload.animationId);
        if (anim) anim.duration = action.payload.duration;
      }
    },
    addElementToPage(state, action: PayloadAction<{ pageId: string; elementId: string }>) {
      const page = state.pages.find(p => p.id === action.payload.pageId);
      if (page && !page.elementIds.includes(action.payload.elementId)) {
        page.elementIds.push(action.payload.elementId);
      }
    },
    removeElementFromPage(state, action: PayloadAction<{ pageId: string; elementId: string }>) {
      const page = state.pages.find(p => p.id === action.payload.pageId);
      if (page) {
        page.elementIds = page.elementIds.filter(id => id !== action.payload.elementId);
      }
    },
    renamePage(state, action: PayloadAction<{ pageId: string; name: string }>) {
      const page = state.pages.find(p => p.id === action.payload.pageId);
      if (page) page.name = action.payload.name;
    },
    updatePageTransition(state, action: PayloadAction<{ pageId: string; transition: PageTransition }>) {
      const page = state.pages.find(p => p.id === action.payload.pageId);
      if (page) page.transition = action.payload.transition;
    },
  },
});

export const {
  addPage, deletePage, setActivePage,
  updatePageLayout, updatePageBackground, updatePageDuration,
  addPageAnimation, removePageAnimation, updatePageAnimationDuration,
  addElementToPage, removeElementFromPage, renamePage, updatePageTransition,
} = pagesSlice.actions;

export default pagesSlice.reducer;
