import React from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { spacing, tokens, typography } from '../constants/theme';
import { HighlightRect, TutorialStep, useTutorial } from '../context/TutorialContext';

const { width: W, height: H } = Dimensions.get('window');

const STEP_CONTENT: Record<
  Exclude<TutorialStep, 'done' | null>,
  { title: string; body: string; next: string }
> = {
  circle: {
    title: 'Your Circle',
    body: 'This is where your people live. Add friends to your Close Friends or Friends ring. They\'ll see your Sidequests and you\'ll see theirs!',
    next: 'Got it →',
  },
  create: {
    title: 'Post a Sidequest',
    body: 'Tap the + button any time you\'re doing something and want company. Your circle will see it and can join with one tap.',
    next: 'Got it →',
  },
  home: {
    title: 'The Feed',
    body: "This is where you\'ll see what your friends are up to. Tap any Sidequest to join in.",
    next: 'Done →',
  },
};

export function TutorialOverlay() {
  const { step, highlight, advance, skip } = useTutorial();

  if (!step || step === 'done') return null;
  const content = STEP_CONTENT[step as Exclude<TutorialStep, 'done' | null>];
  if (!content) return null;

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Dimmed backdrop rendered as 4 rectangles around the cutout */}
        {highlight ? (
          <Cutout rect={highlight} />
        ) : (
          // No highlight measured yet — show full dim
          <View style={[StyleSheet.absoluteFill, styles.fullDim]} />
        )}

        {/* Tooltip card — positioned below cutout if space allows, else above */}
        <TooltipCard highlight={highlight} content={content} onNext={advance} onSkip={skip} />
      </View>
    </Modal>
  );
}

// ─── Cutout ──────────────────────────────────────────────────────────────────

function Cutout({ rect }: { rect: HighlightRect }) {
  const { x, y, width, height } = rect;
  const right = W - (x + width);
  const bottom = H - (y + height);

  return (
    <>
      {/* Top */}
      <View style={[styles.dim, { top: 0, left: 0, right: 0, height: Math.max(0, y) }]} />
      {/* Bottom */}
      <View style={[styles.dim, { bottom: 0, left: 0, right: 0, height: Math.max(0, bottom) }]} />
      {/* Left */}
      <View style={[styles.dim, { top: y, left: 0, width: Math.max(0, x), height }]} />
      {/* Right */}
      <View style={[styles.dim, { top: y, right: 0, width: Math.max(0, right), height }]} />
      {/* Cutout border highlight */}
      <View
        pointerEvents="none"
        style={[
          styles.cutoutBorder,
          { top: y, left: x, width, height },
        ]}
      />
    </>
  );
}

// ─── Tooltip card ─────────────────────────────────────────────────────────────

function TooltipCard({
  highlight,
  content,
  onNext,
  onSkip,
}: {
  highlight: HighlightRect | null;
  content: { title: string; body: string; next: string };
  onNext: () => void;
  onSkip: () => void;
}) {
  const CARD_HEIGHT = 180;
  const MARGIN = 16;

  let top: number;
  if (!highlight) {
    top = H / 2 - CARD_HEIGHT / 2;
  } else {
    const below = highlight.y + highlight.height + MARGIN;
    const above = highlight.y - CARD_HEIGHT - MARGIN;
    // Prefer below, fall back to above
    top = below + CARD_HEIGHT < H - 40 ? below : above;
  }

  return (
    <View style={[styles.card, { top }]}>
      <Text style={[typography.subheading, styles.cardTitle]}>{content.title}</Text>
      <Text style={[typography.body, styles.cardBody]}>{content.body}</Text>
      <View style={styles.cardRow}>
        <Pressable onPress={onSkip} hitSlop={12}>
          <Text style={[typography.caption, styles.skipText]}>Skip tutorial</Text>
        </Pressable>
        <Pressable onPress={onNext} style={styles.nextBtn} hitSlop={12}>
          <Text style={[typography.subheading, styles.nextText]}>{content.next}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  fullDim: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  dim: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cutoutBorder: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  card: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: tokens.surface,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardTitle: {
    color: tokens.text,
    marginBottom: spacing.sm,
  },
  cardBody: {
    color: tokens.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    color: tokens.textSecondary,
    textDecorationLine: 'underline',
  },
  nextBtn: {
    backgroundColor: tokens.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  nextText: {
    color: '#fff',
  },
});
