import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../../components/PrimaryButton';
import { RingBadge } from '../../../components/RingBadge';
import { UserAvatar } from '../../../components/UserAvatar';
import { spacing, tokens, typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import type { User } from '../../../types';
import { minutesAgo, formatTimeRange } from '../../../utils/time';

export default function ViewSidequestModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    sidequests,
    currentUser,
    joinSidequest,
    leaveSidequest,
    cancelSidequest,
  } = useApp();

  const sq = useMemo(() => sidequests.find((s) => s.id === id), [id, sidequests]);
  if (!sq) {
    return (
      <View style={[styles.flex, { padding: spacing.lg }]}>
        <Text style={{ color: tokens.text }}>Sidequest not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: tokens.accent }}>Close</Text>
        </Pressable>
      </View>
    );
  }

  const isOwner = sq.postedBy.id === currentUser.id;
  const isJoined = sq.attendees.some((a: User) => a.id === currentUser.id);
  const spotLeft = Math.max(0, sq.maxAttendees - sq.attendees.length);

  const primaryAction = () => {
    if (isOwner) {
      Alert.alert('Cancel Sidequest?', 'This cannot be undone in the prototype.', [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Sidequest',
          style: 'destructive',
          onPress: () => {
            cancelSidequest(sq.id);
            router.back();
          },
        },
      ]);
      return;
    }
    if (isJoined) {
      leaveSidequest(sq.id);
      return;
    }
    joinSidequest(sq.id);
  };

  const primaryLabel = isOwner
    ? 'Cancel Sidequest'
    : isJoined
      ? 'Leave this sidequest'
      : 'join this sidequest';

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: tokens.modalBackground }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl, paddingHorizontal: spacing.md }}
    >
      <View style={styles.handle} />
      <View style={styles.row}>
        <UserAvatar label={sq.postedBy.avatar} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.subheading, { color: tokens.text }]}>{sq.postedBy.name}</Text>
          <View style={styles.badgeRow}>
            <RingBadge level={sq.postedBy.ringLevel} />
            <Text style={[typography.caption, { color: tokens.textSecondary }]}>
              {minutesAgo(sq.createdAt)}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[typography.heading, styles.title]}>{sq.title}</Text>
      <Text style={[typography.caption, styles.wordFrom]}>
        A WORD FROM {sq.postedBy.name.toUpperCase()}
      </Text>
      <Text style={[typography.body, { color: tokens.text }]}>{sq.description}</Text>
      <Text style={[typography.body, styles.loc]}>
        <Ionicons name="location-sharp" size={16} color={tokens.text} /> {sq.location}
      </Text>
      <Text style={[typography.body, styles.loc]}>
        <Ionicons name="time-outline" size={16} color={tokens.text} />{' '}
        {formatTimeRange(sq.startTime, sq.endTime)}
      </Text>
      <View style={styles.divider} />
      <Text style={[typography.subheading, { color: tokens.text }]}>WHO&apos;S GOING</Text>
      <View style={styles.avatarRow}>
        {sq.attendees.map((a: User) => (
          <View key={a.id} style={{ marginRight: -12 }}>
            <UserAvatar label={a.avatar} size={40} />
          </View>
        ))}
      </View>
      <Text style={[typography.body, { color: tokens.text }]}>
        {sq.attendees.map((a: User) => a.name).join(', ')}
      </Text>
      <Text style={[typography.subheading, { color: tokens.text, marginTop: 4 }]}>
        {spotLeft} spot{spotLeft === 1 ? '' : 's'} left
      </Text>
      <View style={styles.divider} />
      <Text style={[typography.subheading, { color: tokens.text }]}>GETTING THERE</Text>
      <View style={styles.map} />
      <Text style={[typography.caption, { color: tokens.textSecondary }]}>
        ~0.8 mi · ~12 min walk
      </Text>
      <PrimaryButton
        label={primaryLabel}
        variant={isOwner ? 'danger' : 'fill'}
        onPress={primaryAction}
        style={{ marginTop: spacing.lg }}
      />
      {!isOwner ? (
        <Pressable style={{ marginTop: spacing.md }} onPress={() => {}}>
          <Text style={[typography.caption, { color: tokens.text, textAlign: 'center' }]}>
            or send {sq.postedBy.name.split(' ')[0]} a message
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.border,
    marginVertical: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  title: { color: tokens.text, marginTop: spacing.md },
  wordFrom: {
    color: tokens.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  loc: { color: tokens.text, marginTop: 4 },
  divider: {
    height: 1,
    backgroundColor: tokens.border,
    marginVertical: spacing.md,
  },
  avatarRow: { flexDirection: 'row', marginVertical: spacing.sm },
  map: {
    height: 120,
    borderRadius: 12,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    marginTop: spacing.sm,
  },
});
