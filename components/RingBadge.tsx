import { StyleSheet, Text, View } from 'react-native';

import { sidequestCard, tokens, typography } from '../constants/theme';
import type { RingLevel } from '../types';
import { ringLabel } from '../utils/ringLabel';

type Props = {
  level: RingLevel;
  /** On dark surfaces (e.g. SidequestCard) use `light`. */
  tone?: 'light' | 'dark';
};

export function RingBadge({ level, tone = 'dark' }: Props) {
  const light = tone === 'light';
  return (
    <View style={[styles.pill, light && styles.pillLight]}>
      <Text style={[typography.caption, light ? styles.textLight : styles.textDark]}>
        {ringLabel(level)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: tokens.border,
  },
  pillLight: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  textDark: {
    color: tokens.text,
  },
  textLight: {
    color: sidequestCard.titleColor,
  },
});
