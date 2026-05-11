import { Middleware } from '@reduxjs/toolkit';

export const persistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  
  if (typeof window !== 'undefined') {
    const projectData = {
      pages: state.pages,
      elements: state.elements,
      ui: {
        resources: state.ui.resources,
        darkMode: state.ui.darkMode,
        zoom: state.ui.zoom,
        canvasZoom: state.ui.canvasZoom,
      },
      timeline: {
        totalDuration: state.timeline.totalDuration,
      }
    };
    localStorage.setItem('video_creator_project', JSON.stringify(projectData));
  }
  
  return result;
};

export const loadState = () => {
  if (typeof window === 'undefined') return undefined;
  try {
    const serializedState = localStorage.getItem('video_creator_project');
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch {
    return undefined;
  }
};
