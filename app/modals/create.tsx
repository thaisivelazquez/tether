import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { spacing, tokens, typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function CreateModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addSidequest } = useApp();
  const [title, setTitle] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toDate, setToDate] = useState('');
  const [toTime, setToTime] = useState('');
  const [location, setLocation] = useState('');
  const [detail, setDetail] = useState('');
  const [maxAtt, setMaxAtt] = useState('1');
  const [vis, setVis] = useState<'everyone' | 'close-friends'>('close-friends');
  const [openVis, setOpenVis] = useState(false);

  const submit = () => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(15, 0, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    addSidequest({
      title: title.trim() || 'share what you are up to',
      description: detail.trim() || 'Tell your friends what to expect.',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      location: location.trim() || 'Columbia University area',
      maxAttendees: Math.max(1, parseInt(maxAtt, 10) || 1),
      visibility: vis,
    });
    router.back();
  };

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: tokens.surface }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl, paddingHorizontal: spacing.md }}
    >
      <View style={styles.handle} />
      <Text style={[typography.caption, styles.dragLabel]}>CREATE SIDEQUEST</Text>
      <TextInput
        style={[typography.body, styles.bigInput]}
        placeholder="share what you're up to..."
        placeholderTextColor={tokens.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      <Text style={[typography.caption, styles.lab]}>FROM</Text>
      <View style={styles.row}>
        <TextInput style={styles.pill} placeholder="date" value={fromDate} onChangeText={setFromDate} />
        <TextInput style={styles.pill} placeholder="time" value={fromTime} onChangeText={setFromTime} />
      </View>
      <Text style={[typography.caption, styles.lab]}>TO</Text>
      <View style={styles.row}>
        <TextInput style={styles.pill} placeholder="date" value={toDate} onChangeText={setToDate} />
        <TextInput style={styles.pill} placeholder="time" value={toTime} onChangeText={setToTime} />
      </View>
      <TextInput
        style={styles.input}
        placeholder="📍 location"
        placeholderTextColor={tokens.textSecondary}
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="TELL YOUR FRIENDS WHAT TO EXPECT..."
        placeholderTextColor={tokens.textSecondary}
        value={detail}
        onChangeText={setDetail}
        multiline
      />
      <Text style={[typography.caption, styles.lab]}>MAX ATTENDEES</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={maxAtt}
        onChangeText={setMaxAtt}
      />
      <Text style={[typography.caption, styles.lab]}>VISIBILITY</Text>
      <Pressable style={styles.input} onPress={() => setOpenVis((v) => !v)}>
        <Text style={{ color: tokens.text }}>{vis === 'everyone' ? 'Everyone' : 'Close Friends'}</Text>
      </Pressable>
      {openVis ? (
        <View>
          <Pressable onPress={() => { setVis('close-friends'); setOpenVis(false); }} style={styles.opt}>
            <Text style={{ color: tokens.text }}>Close Friends</Text>
          </Pressable>
          <Pressable onPress={() => { setVis('everyone'); setOpenVis(false); }} style={styles.opt}>
            <Text style={{ color: tokens.text }}>Everyone</Text>
          </Pressable>
        </View>
      ) : null}
      <PrimaryButton label="share →" onPress={submit} style={{ marginTop: spacing.lg }} />
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
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  dragLabel: { textAlign: 'center', color: tokens.textSecondary, marginBottom: spacing.md },
  bigInput: {
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 12,
    padding: spacing.md,
    color: tokens.text,
    marginBottom: spacing.md,
  },
  lab: { color: tokens.textSecondary, marginBottom: 4 },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 999,
    padding: 10,
    color: tokens.text,
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 12,
    padding: 12,
    color: tokens.text,
    marginBottom: spacing.sm,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  opt: { paddingVertical: 8 },
});
