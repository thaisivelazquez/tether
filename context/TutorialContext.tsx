import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';

export type TutorialStep =
  | 'circle'      // step 1 – highlight circle diagram + add friend
  | 'create'      // step 2 – highlight create sidequest sheet
  | 'home'        // step 3 – highlight homepage feed
  | 'done'        // tutorial finished, show profile badge
  | null;         // tutorial not started / fully complete

export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TutorialCtx {
  step: TutorialStep;
  highlight: HighlightRect | null;
  startTutorial: () => void;
  advance: () => void;
  skip: () => void;
  registerRef: (ref: React.RefObject<View>) => void;
  measureAndSet: () => void;
}

const Ctx = createContext<TutorialCtx | null>(null);

const STEP_ORDER: TutorialStep[] = ['circle', 'create', 'home', 'done'];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState<TutorialStep>(null);
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);
  const targetRef = useRef<View | null>(null);

  const startTutorial = useCallback(() => setStep('circle'), []);

  const advance = useCallback(() => {
    setStep((current) => {
      const idx = STEP_ORDER.indexOf(current);
      if (idx === -1 || idx >= STEP_ORDER.length - 1) return null;
      return STEP_ORDER[idx + 1];
    });
    setHighlight(null);
  }, []);

  const skip = useCallback(() => {
    setStep('done');
    setHighlight(null);
  }, []);

  const registerRef = useCallback((ref: React.RefObject<View>) => {
    targetRef.current = ref.current;
  }, []);

  const measureAndSet = useCallback(() => {
    if (!targetRef.current) return;
    targetRef.current.measureInWindow((x, y, width, height) => {
      const PAD = 12;
      setHighlight({
        x: x - PAD,
        y: y - PAD,
        width: width + PAD * 2,
        height: height + PAD * 2,
      });
    });
  }, []);

  return (
    <Ctx.Provider
      value={{ step, highlight, startTutorial, advance, skip, registerRef, measureAndSet }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTutorial() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTutorial must be used inside TutorialProvider');
  return ctx;
}
