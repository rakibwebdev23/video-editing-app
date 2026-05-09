import { LayoutType } from '../types/editor.types';

export interface LayoutConfig {
  id: LayoutType;
  label: string;
  zones: number;
  icon: string;
  gridTemplate?: string;
}

export const LAYOUTS: LayoutConfig[] = [
  { id: 'single', label: '1', zones: 1, icon: '□' },
  { id: 'horizontal-1-1', label: '1:1', zones: 2, icon: '⬜⬜' },
  { id: 'horizontal-2-1', label: '2:1', zones: 2, icon: '▬□' },
  { id: 'horizontal-1-2', label: '1:2', zones: 2, icon: '□▬' },
  { id: 'vertical-1-2', label: '1|2', zones: 2, icon: '▯▯' },
  { id: 'grid-2-2', label: '2×2', zones: 4, icon: '⊞' },
];

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const DEFAULT_ZOOM = 0.6;
