import type { RingLevel } from '../types';

export function ringLabel(level: RingLevel): 'Close Friends' | 'Friends' {
  return level === 'close-friends' ? 'Close Friends' : 'Friends';
}
