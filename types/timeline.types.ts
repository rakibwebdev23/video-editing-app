export interface TimelineClip {
  id: string;
  elementId: string;
  pageId: string;
  type: 'image' | 'video' | 'audio';
  name: string;
  startTime: number;
  duration: number;
  track: 'video' | 'audio';
  color: string;
}

export interface TimelineState {
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  zoom: number; // pixels per second
  scrubberPosition: number;
}
