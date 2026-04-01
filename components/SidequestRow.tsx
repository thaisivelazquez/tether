import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tokens, typography } from '../constants/theme';
import type { Sidequest } from '../types';
import { formatSidequestTimeLabel } from '../utils/time';

type Props = {
  sidequest: Sidequest;
  onPress: () => void;
};

export function SidequestRow({ sidequest, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[typography.subheading, styles.title]} numberOfLines={1}>
          {sidequest.title}
        </Text>
        <Text style={[typography.caption, styles.meta]} numberOfLines={1}>
          {sidequest.location} · {formatSidequestTimeLabel(sidequest.startTime)} ·{' '}
          {sidequest.attendees.length}/{sidequest.maxAttendees}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={tokens.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  title: {
    color: tokens.text,
  },
  meta: {
    color: tokens.textSecondary,
    marginTop: 2,
  },
});
