import { FillMode, AnimationName, AnimationCategory } from './editor.types';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementAnimation {
  id: string;
  name: AnimationName;
  category: AnimationCategory;
  duration: number;
}

export type ShapeType = 'text' | 'qr' | 'slider' | 'rectangle' | 'ellipse' | 'triangle';

export interface CanvasElement {
  id: string;
  pageId: string;
  resourceId: string;
  type: 'image' | 'video' | 'audio' | 'shape';
  shapeType?: ShapeType;
  url: string;
  name: string;
  thumbnail?: string;
  // Shape / text content
  content?: string;
  // Layout zone (null = free position)
  zone: number | null;
  // Position & size
  x: number;
  y: number;
  width: number;
  height: number;
  // Style
  fillMode: FillMode;
  opacity: number;
  rotation: number;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  // Free position
  freePosition: boolean;
  // Timing
  startTime: number;
  duration: number;
  startTimeOffset?: number; // Internal offset for trimming (seconds)
  // Audio properties
  volume?: number;    // 0-100
  fadeIn?: number;    // seconds
  fadeOut?: number;   // seconds
  // Animation
  animations: ElementAnimation[];
  // Z-order
  zIndex: number;
}
