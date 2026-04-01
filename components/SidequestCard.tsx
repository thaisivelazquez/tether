import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { sidequestCard, typography } from '../constants/theme';
import type { Sidequest } from '../types';
import { formatSidequestTimeLabel } from '../utils/time';

import { RingBadge } from './RingBadge';
import { UserAvatar } from './UserAvatar';

type Props = {
  sidequest: Sidequest;
  onPress: () => void;
};

export function SidequestCard({ sidequest, onPress }: Props) {
  const { postedBy, title, description, location, maxAttendees, attendees, startTime } = sidequest;
  const timeLabel = formatSidequestTimeLabel(startTime);
  const desc = description.split('\n')[0];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}>
      <View style={styles.row1}>
        <UserAvatar label={postedBy.avatar} size={36} />
        <Text style={[typography.caption, styles.name]} numberOfLines={1}>
          {postedBy.name}
        </Text>
        <RingBadge level={postedBy.ringLevel} tone="light" />
        <Text style={[typography.caption, styles.time]}>{timeLabel}</Text>
      </View>
      <Text style={[typography.heading, styles.title]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[typography.body, styles.desc]} numberOfLines={1}>
        {desc}
      </Text>
      <View style={styles.row4}>
        <View style={styles.metaRow}>
          <Ionicons name="location-sharp" size={14} color={sidequestCard.mutedColor} />
          <Text style={[typography.caption, styles.meta]} numberOfLines={1}>
            {location}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={14} color={sidequestCard.mutedColor} />
          <Text style={[typography.caption, styles.meta]}>
            {attendees.length}/{maxAttendees} going
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: sidequestCard.borderRadius,
    borderWidth: sidequestCard.borderWidth,
    borderColor: sidequestCard.borderColor,
    backgroundColor: sidequestCard.background,
    padding: 14,
    marginBottom: 12,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  name: {
    flex: 1,
    color: sidequestCard.titleColor,
    fontWeight: '600',
  },
  time: {
    color: sidequestCard.mutedColor,
    textTransform: 'lowercase',
  },
  title: {
    color: sidequestCard.titleColor,
    marginBottom: 6,
  },
  desc: {
    color: sidequestCard.mutedColor,
    marginBottom: 10,
  },
  row4: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    color: sidequestCard.mutedColor,
    flex: 1,
  },
});
