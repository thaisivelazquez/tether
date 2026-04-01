import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tokens, typography } from '../constants/theme';

export type FeedFilter = 'all' | 'close-friends';

type Props = {
  value: FeedFilter;
  onChange: (v: FeedFilter) => void;
};

export function PillToggle({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange('all')}
        style={[styles.pill, value === 'all' && styles.pillActive]}
      >
        <Text style={[typography.caption, value === 'all' ? styles.labelActive : styles.label]}>
          ALL
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('close-friends')}
        style={[styles.pill, value === 'close-friends' && styles.pillActive]}
      >
        <Text
          style={[
            typography.caption,
            value === 'close-friends' ? styles.labelActive : styles.label,
          ]}
        >
          CLOSE FRIENDS
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: tokens.border,
  },
  pillActive: {
    backgroundColor: tokens.surface,
  },
  label: {
    color: tokens.text,
    fontWeight: '600',
  },
  labelActive: {
    color: tokens.text,
    fontWeight: '700',
  },
});
