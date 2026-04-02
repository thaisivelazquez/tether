import { Pressable, StyleSheet, Text, View } from 'react-native';

import { sidequestCard, typography } from '../sidequest/theme';
import type { Sidequest } from '../sidequest/types';

type Props = {
  sidequest: Sidequest;
  onPress: () => void;
};

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function SidequestCard({ sidequest, onPress }: Props) {
  const { postedBy, title, description, location, maxAttendees, attendees, startTime } = sidequest;

  const timeLabel = formatTime(startTime);
  const desc = description.split('\n')[0];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}>
      <View style={styles.row1}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(postedBy.name)}</Text>
        </View>

        <Text style={[typography.caption, styles.name]} numberOfLines={1}>
          {postedBy.name}
        </Text>

        <Text style={[typography.caption, styles.ring]}>
          Lv {postedBy.ringLevel}
        </Text>

        <Text style={[typography.caption, styles.time]}>
          {timeLabel}
        </Text>
      </View>

      <Text style={[typography.heading, styles.title]} numberOfLines={2}>
        {title}
      </Text>

      <Text style={[typography.body, styles.desc]} numberOfLines={1}>
        {desc}
      </Text>

      <View style={styles.row4}>
        <View style={styles.metaRow}>
          <Text style={[typography.caption, styles.meta]} numberOfLines={1}>
            {location}
          </Text>
        </View>

        <View style={styles.metaRow}>
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  name: {
    flex: 1,
    color: sidequestCard.titleColor,
    fontWeight: '600',
  },
  ring: {
    color: sidequestCard.mutedColor,
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