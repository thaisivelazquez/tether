import { Pressable, StyleSheet, Text } from 'react-native';

import { tokens, typography } from '../constants/theme';
import type { Notification } from '../types';
import { formatSidequestTimeLabel } from '../utils/time';

type Props = {
  notification: Notification;
  onPress: () => void;
};

function renderSentence(n: Notification) {
  const { type, sidequest, triggeredBy } = n;
  const a = triggeredBy[0]?.name ?? 'Someone';
  const b = triggeredBy[1]?.name;
  const title = sidequest.title;
  const loc = sidequest.location;

  switch (type) {
    case 'new_sidequest':
      return (
        <>
          <Text style={styles.bold}>{a}</Text> just posted a new Sidequest happening{' '}
          <Text style={styles.bold}>{formatSidequestTimeLabel(sidequest.startTime)}</Text>!
        </>
      );
    case 'join':
      return (
        <>
          <Text style={styles.bold}>{a}</Text> joined your Sidequest <Text style={styles.bold}>{title}</Text>.
        </>
      );
    case 'co_join':
      return (
        <>
          <Text style={styles.bold}>{a}</Text> is also coming to <Text style={styles.bold}>{title}</Text>!
        </>
      );
    case 'reminder':
      return (
        <>
          <Text style={styles.bold}>{a}</Text>
          {b ? (
            <>
              {' '}
              and <Text style={styles.bold}>{b}</Text>
            </>
          ) : null}{' '}
          are headed to <Text style={styles.bold}>{loc}</Text> in 2h. There&apos;s room for one more.
        </>
      );
    case 'heading_out':
      return (
        <>
          <Text style={styles.bold}>{a}</Text> is heading out for <Text style={styles.bold}>{title}</Text>.
        </>
      );
    default:
      return null;
  }
}

export function NotificationRow({ notification, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <Text style={[typography.body, styles.text]}>{renderSentence(notification)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  text: {
    color: tokens.text,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
  },
});
