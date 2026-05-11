import { AnimationConfig } from '../types/animation.types';

export const ENTER_ANIMATIONS: AnimationConfig[] = [
  { name: 'fadeIn', label: 'Fade In', category: 'enter', icon: '✦', defaultDuration: 1.0 },
  { name: 'enterLeft', label: 'Enter Left', category: 'enter', icon: '←', defaultDuration: 0.8 },
  { name: 'enterRight', label: 'Enter Right', category: 'enter', icon: '→', defaultDuration: 0.8 },
  { name: 'enterUp', label: 'Enter Up', category: 'enter', icon: '↑', defaultDuration: 0.8 },
  { name: 'enterDown', label: 'Enter Down', category: 'enter', icon: '↓', defaultDuration: 0.8 },
  { name: 'rotateIn', label: 'Rotate In', category: 'enter', icon: '↻', defaultDuration: 0.9 },
  { name: 'flipX', label: 'Flip X', category: 'enter', icon: '⟺', defaultDuration: 0.8 },
  { name: 'flipY', label: 'Flip Y', category: 'enter', icon: '⇅', defaultDuration: 0.8 },
  { name: 'flip', label: 'Flip', category: 'enter', icon: '⊛', defaultDuration: 0.8 },
  { name: 'zoomIn', label: 'Zoom In', category: 'enter', icon: '⊕', defaultDuration: 0.7 },
  { name: 'rollIn', label: 'Roll In', category: 'enter', icon: '⊙', defaultDuration: 1.0 },
  { name: 'slideIn', label: 'Slide In', category: 'enter', icon: '▷', defaultDuration: 0.6 },
  { name: 'blurIn', label: 'Blur In', category: 'enter', icon: '◌', defaultDuration: 1.2 },
];

export const EMPHASIS_ANIMATIONS: AnimationConfig[] = [
  { name: 'pulse', label: 'Pulse', category: 'emphasis', icon: '◎', defaultDuration: 0.8 },
  { name: 'shake', label: 'Shake', category: 'emphasis', icon: '≋', defaultDuration: 0.5 },
  { name: 'bounce', label: 'Bounce', category: 'emphasis', icon: '⊻', defaultDuration: 1.0 },
  { name: 'spin', label: 'Spin', category: 'emphasis', icon: '↺', defaultDuration: 1.0 },
  { name: 'flash', label: 'Flash', category: 'emphasis', icon: '⚡', defaultDuration: 0.5 },
  { name: 'swing', label: 'Swing', category: 'emphasis', icon: '↔', defaultDuration: 0.8 },
  { name: 'tada', label: 'Tada', category: 'emphasis', icon: '★', defaultDuration: 1.0 },
  { name: 'rubber', label: 'Rubber Band', category: 'emphasis', icon: '⤢', defaultDuration: 1.0 },
  { name: 'jello', label: 'Jello', category: 'emphasis', icon: '〜', defaultDuration: 0.9 },
  { name: 'heartBeat', label: 'Heart Beat', category: 'emphasis', icon: '♥', defaultDuration: 1.3 },
  { name: 'wobble', label: 'Wobble', category: 'emphasis', icon: '~', defaultDuration: 1.0 },
  { name: 'headShake', label: 'Head Shake', category: 'emphasis', icon: '⇔', defaultDuration: 1.0 },
];

export const EXIT_ANIMATIONS: AnimationConfig[] = [
  { name: 'fadeOut', label: 'Fade Out', category: 'exit', icon: '✧', defaultDuration: 1.0 },
  { name: 'exitLeft', label: 'Exit Left', category: 'exit', icon: '←', defaultDuration: 0.8 },
  { name: 'exitRight', label: 'Exit Right', category: 'exit', icon: '→', defaultDuration: 0.8 },
  { name: 'exitUp', label: 'Exit Up', category: 'exit', icon: '↑', defaultDuration: 0.8 },
  { name: 'exitDown', label: 'Exit Down', category: 'exit', icon: '↓', defaultDuration: 0.8 },
  { name: 'zoomOut', label: 'Zoom Out', category: 'exit', icon: '⊖', defaultDuration: 0.7 },
  { name: 'rotateOut', label: 'Rotate Out', category: 'exit', icon: '↺', defaultDuration: 0.9 },
  { name: 'flipOutX', label: 'Flip Out X', category: 'exit', icon: '⟺', defaultDuration: 0.8 },
  { name: 'flipOutY', label: 'Flip Out Y', category: 'exit', icon: '⇅', defaultDuration: 0.8 },
  { name: 'slideOut', label: 'Slide Out', category: 'exit', icon: '◁', defaultDuration: 0.6 },
  { name: 'rollOut', label: 'Roll Out', category: 'exit', icon: '⊗', defaultDuration: 1.0 },
  { name: 'hinge', label: 'Hinge', category: 'exit', icon: '⊾', defaultDuration: 2.0 },
  { name: 'blurOut', label: 'Blur Out', category: 'exit', icon: '◌', defaultDuration: 1.2 },
];

export const ALL_ANIMATIONS = [...ENTER_ANIMATIONS, ...EMPHASIS_ANIMATIONS, ...EXIT_ANIMATIONS];
