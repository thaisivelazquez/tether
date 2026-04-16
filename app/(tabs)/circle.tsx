import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

import { CircleDiagram } from '../../components/CircleDiagram';
import { PrimaryButton } from '../../components/PrimaryButton';
import { spacing, tokens, typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useTutorial } from '../../context/TutorialContext';

export default function CircleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { users, currentUser, circleMemberIds, addFriendByPhone } = useApp();
  const { step, registerRef, measureAndSet, advance } = useTutorial();
  const members = users.filter((u) => circleMemberIds.includes(u.id));

  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);

  // Ref wrapping the area we want to highlight (diagram + add friend link)
  const highlightRef = useRef<View>(null);

  useEffect(() => {
    if (step === 'circle') {
      // Small delay to ensure layout is complete before measuring
      const t = setTimeout(() => {
        registerRef(highlightRef);
        measureAndSet();
      }, 350);
      return () => clearTimeout(t);
    }
  }, [step]);

  // When the tutorial is on 'create', open the create modal and advance
  useEffect(() => {
    if (step === 'create') {
      // Brief delay so the tab transition completes first
      const t = setTimeout(() => {
        router.push('/modals/create');
      }, 300);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.pad,
        { paddingTop: insets.top + spacing.md, paddingBottom: 120 },
      ]}
    >
      <Text style={[typography.heading, styles.h]}>your circle</Text>

      {/* Highlighted area for tutorial step 1 */}
      <View ref={highlightRef} collapsable={false}>
        <CircleDiagram currentUser={currentUser} members={members} mode="view" />
        <View style={styles.legend}>
          <Text style={[typography.caption, styles.leg]}>
            Inner: Close Friends · Outer: Friends
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setOpen(true);
            setDone(false);
            setPhone('');
          }}
          style={styles.link}
        >
          <Text style={[typography.subheading, styles.linkText]}>+ ADD FRIEND</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.push('/modals/circle-edit')} style={styles.link}>
        <Text style={[typography.subheading, styles.linkText]}>✏ EDIT CIRCLE</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text
              style={[typography.subheading, { color: tokens.text, marginBottom: spacing.sm }]}
            >
              Add friend
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={tokens.textSecondary}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            {done ? (
              <Text style={[typography.body, { color: tokens.text, marginTop: spacing.sm }]}>
                Friend added to your circle.
              </Text>
            ) : null}
            <PrimaryButton
              label="Send invite"
              onPress={() => {
                addFriendByPhone(phone);
                setDone(true);
              }}
              style={{ marginTop: spacing.md }}
            />
            <Pressable onPress={() => setOpen(false)} style={{ marginTop: spacing.sm }}>
              <Text style={[typography.caption, { color: tokens.textSecondary }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: spacing.md },
  h: { color: tokens.text, marginBottom: spacing.md },
  link: { marginTop: spacing.md },
  linkText: { color: tokens.text, textDecorationLine: 'underline' },
  legend: { marginTop: spacing.sm, marginBottom: spacing.sm },
  leg: { textAlign: 'center', color: tokens.textSecondary },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: tokens.surface,
    padding: spacing.lg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 12,
    padding: 12,
    color: tokens.text,
  },
});
