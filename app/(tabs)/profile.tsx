import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { SidequestRow } from '../../components/SidequestRow';
import { UserAvatar } from '../../components/UserAvatar';
import { spacing, tokens, typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function ProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { users, currentUser, sidequests, updateUser, circleMemberIds } = useApp();

  const profileUser = useMemo(() => {
    if (!userId || userId === currentUser.id) return currentUser;
    return users.find((u) => u.id === userId) ?? currentUser;
  }, [userId, users, currentUser]);

  const isOwn = profileUser.id === currentUser.id;

  const mineGoing = sidequests.filter((s) => s.attendees.some((a) => a.id === profileUser.id));
  const minePosted = sidequests.filter((s) => s.postedBy.id === profileUser.id);

  const circlePeeps = users.filter((u) => u.id !== profileUser.id && circleMemberIds.includes(u.id)).slice(0, 8);

  const mutuals = users.filter((u) => u.id !== profileUser.id && u.id !== currentUser.id).slice(0, 6);

  const [editOpen, setEditOpen] = useState(false);
  const [fn, setFn] = useState(profileUser.name.split(' ')[0] ?? '');
  const [ln, setLn] = useState(profileUser.name.split(' ').slice(1).join(' ') ?? '');
  const [st, setSt] = useState(profileUser.status ?? '');
  const [loc, setLoc] = useState(profileUser.location ?? '');
  const [bd, setBd] = useState(profileUser.birthday ?? '');

  const saveEdit = () => {
    updateUser(currentUser.id, {
      name: `${fn} ${ln}`.trim(),
      status: st,
      location: loc,
      birthday: bd,
    });
    setEditOpen(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.pad, { paddingTop: insets.top + spacing.md, paddingBottom: 120 }]}
    >
      <View style={styles.topRow}>
        {isOwn ? (
          <Pressable onPress={() => setEditOpen(true)} hitSlop={12}>
            <Ionicons name="pencil" size={22} color={tokens.text} />
          </Pressable>
        ) : (
          <View style={{ width: 22 }} />
        )}
        <Text style={[typography.subheading, styles.centerTitle]}>
          {isOwn ? 'Profile' : profileUser.name}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      <UserAvatar label={profileUser.avatar} size={96} />
      <Text style={[typography.heading, styles.name]}>{profileUser.name}</Text>
      <Text style={[typography.body, styles.meta]}>{profileUser.status}</Text>
      <Text style={[typography.caption, styles.meta]}>
        {profileUser.location} · {profileUser.birthday}
      </Text>

      {isOwn ? (
        <PrimaryButton label="SHARE PROFILE" variant="outline" onPress={() => {}} style={{ marginTop: spacing.md }} />
      ) : (
        <PrimaryButton label="+ ADD FRIEND" variant="outline" onPress={() => {}} style={{ marginTop: spacing.md }} />
      )}

      {isOwn ? (
        <>
          <Text style={[typography.subheading, styles.section]}>Friends</Text>
          <Text style={[typography.caption, styles.sub]}>People in your circle 🦅</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowScroll}>
            {circlePeeps.map((u) => (
              <Pressable key={u.id} onPress={() => router.push(`/(tabs)/profile?userId=${u.id}`)} style={styles.avatarPad}>
                <UserAvatar label={u.avatar} size={48} />
              </Pressable>
            ))}
          </ScrollView>
          <Text style={[typography.caption, styles.sub]}>
            You are making {minePosted.length} things happen...
          </Text>
          {minePosted.map((s) => (
            <SidequestRow key={s.id} sidequest={s} onPress={() => router.push(`/modals/sidequest/${s.id}`)} />
          ))}
          <Text style={[typography.caption, styles.sub]}>You and your friends are...</Text>
          {mineGoing.map((s) => (
            <SidequestRow key={s.id} sidequest={s} onPress={() => router.push(`/modals/sidequest/${s.id}`)} />
          ))}
        </>
      ) : (
        <>
          <Text style={[typography.subheading, styles.section]}>Mutuals</Text>
          <Text style={[typography.caption, styles.sub]}>
            Friends of yours who are in {profileUser.name.split(' ')[0]}&apos;s circle 👫
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rowScroll}>
            {mutuals.map((u) => (
              <Pressable key={u.id} onPress={() => router.push(`/(tabs)/profile?userId=${u.id}`)} style={styles.avatarPad}>
                <UserAvatar label={u.avatar} size={48} />
              </Pressable>
            ))}
          </ScrollView>
          <Text style={[typography.caption, styles.sub]}>
            {profileUser.name.split(' ')[0]} is making {minePosted.length} things happen...
          </Text>
          {minePosted.map((s) => (
            <SidequestRow key={s.id} sidequest={s} onPress={() => router.push(`/modals/sidequest/${s.id}`)} />
          ))}
        </>
      )}

      <Modal visible={editOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setEditOpen(false)}>
                <Text style={[typography.subheading, { color: tokens.text }]}>×</Text>
              </Pressable>
              <Text style={[typography.subheading, { color: tokens.text }]}>EDIT PROFILE</Text>
              <View style={{ width: 16 }} />
            </View>
            <UserAvatar label={currentUser.avatar} size={72} />
            <Field label="First name" v={fn} set={setFn} />
            <Field label="Last name" v={ln} set={setLn} />
            <Field label="Add status" v={st} set={setSt} />
            <Field label="Set location" v={loc} set={setLoc} />
            <Field label="Set birthday" v={bd} set={setBd} />
            <PrimaryButton label="Save" onPress={saveEdit} style={{ marginTop: spacing.md }} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Field({
  label,
  v,
  set,
}: {
  label: string;
  v: string;
  set: (x: string) => void;
}) {
  return (
    <View style={{ marginTop: spacing.sm, width: '100%' }}>
      <Text style={[typography.caption, { color: tokens.textSecondary }]}>{label}</Text>
      <TextInput
        value={v}
        onChangeText={set}
        style={styles.input}
        placeholderTextColor={tokens.textSecondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  centerTitle: { color: tokens.text },
  name: { color: tokens.text, marginTop: spacing.sm },
  meta: { color: tokens.textSecondary, marginTop: 4 },
  section: { color: tokens.text, marginTop: spacing.lg },
  sub: { color: tokens.textSecondary, marginTop: spacing.sm },
  rowScroll: { marginVertical: spacing.sm },
  avatarPad: { marginRight: spacing.sm },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: tokens.text,
    backgroundColor: tokens.surface,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: tokens.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
