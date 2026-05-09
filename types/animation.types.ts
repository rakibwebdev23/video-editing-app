import { AnimationCategory, AnimationName } from './editor.types';

export interface AnimationConfig {
  name: AnimationName;
  label: string;
  category: AnimationCategory;
  icon: string;
  defaultDuration: number;
}
