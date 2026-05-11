export type LayoutType =
  | 'single'
  | 'horizontal-1-1'
  | 'horizontal-2-1'
  | 'horizontal-1-2'
  | 'vertical-1-2'
  | 'grid-2-2';

export type MediaType = 'image' | 'video' | 'audio';
export type FillMode = 'fill' | 'fit' | 'stretch' | 'center';
export type AnimationCategory = 'enter' | 'emphasis' | 'exit';
export type AnimationName =
  // Enter
  | 'fadeIn' | 'enterLeft' | 'enterRight' | 'enterUp' | 'enterDown'
  | 'rotateIn' | 'flipX' | 'flipY' | 'flip' | 'zoomIn' | 'rollIn' | 'slideIn' | 'blurIn'
  // Emphasis
  | 'pulse' | 'shake' | 'bounce' | 'spin' | 'flash' | 'swing'
  | 'tada' | 'rubber' | 'jello' | 'heartBeat' | 'wobble' | 'headShake'
  // Exit
  | 'fadeOut' | 'exitLeft' | 'exitRight' | 'exitUp' | 'exitDown'
  | 'zoomOut' | 'rotateOut' | 'flipOutX' | 'flipOutY' | 'slideOut' | 'rollOut' | 'hinge' | 'blurOut';

export interface PageAnimation {
  id: string;
  name: AnimationName;
  category: AnimationCategory;
  duration: number;
}

export interface Page {
  id: string;
  name: string;
  layout: LayoutType;
  backgroundColor: string;
  duration: number; // seconds
  transition: PageTransition;
  animations: PageAnimation[];
  elementIds: string[];
  color: string; // tab color
}

export interface MediaResource {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  thumbnail?: string;
  duration?: number;
  width?: number;
  height?: number;
  size?: number;
}

export type SidebarTab = 'upload' | 'elements' | 'live';
export type MediaFilter = 'all' | 'image' | 'video' | 'audio';

export type TransitionName =
  | 'none' | 'fade' | 'fadeBlack' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown'
  | 'zoom' | 'flip' | 'rotate' | 'wipe' | 'blur';

export interface PageTransition {
  name: TransitionName;
  duration: number;
}
