import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOCK_UNIVERSITIES } from '../../constants/mockData';
import { spacing, tokens, typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function ProfileSetup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUser, currentUser } = useApp();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [birthday, setBirthday] = useState('');
  const [location, setLocation] = useState<string>(MOCK_UNIVERSITIES[0]);
  const [affiliation, setAffiliation] = useState<string>(MOCK_UNIVERSITIES[0]);
  const [openLoc, setOpenLoc] = useState(false);
  const [openAff, setOpenAff] = useState(false);

  const save = () => {
    updateUser(currentUser.id, {
      name: `${first.trim() || 'Alex'} ${last.trim() || 'Rivera'}`.trim(),
      birthday: birthday || currentUser.birthday,
      location: location,
      status: currentUser.status,
    });
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.flex, { paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xl }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[typography.heading, styles.h]}>
        one last thing— tell us about yourself.
      </Text>
      <Field label="First name" value={first} onChange={setFirst} />
      <Field label="Last name" value={last} onChange={setLast} />
      <Field label="Birthday (DD/MM)" value={birthday} onChange={setBirthday} placeholder="12/03" />
      <Text style={[typography.caption, styles.lab]}>Location</Text>
      <Pressable style={styles.select} onPress={() => setOpenLoc((v) => !v)}>
        <Text style={[typography.body, { color: tokens.text }]}>{location}</Text>
      </Pressable>
      {openLoc &&
        MOCK_UNIVERSITIES.map((u) => (
          <Pressable key={u} onPress={() => { setLocation(u); setOpenLoc(false); }} style={styles.opt}>
            <Text style={{ color: tokens.text }}>{u}</Text>
          </Pressable>
        ))}
      <Text style={[typography.caption, styles.lab]}>Affiliation</Text>
      <Pressable style={styles.select} onPress={() => setOpenAff((v) => !v)}>
        <Text style={[typography.body, { color: tokens.text }]}>{affiliation}</Text>
      </Pressable>
      {openAff &&
        MOCK_UNIVERSITIES.map((u) => (
          <Pressable key={u} onPress={() => { setAffiliation(u); setOpenAff(false); }} style={styles.opt}>
            <Text style={{ color: tokens.text }}>{u}</Text>
          </Pressable>
        ))}
      <Pressable onPress={save} style={styles.cta}>
        <Text style={[typography.subheading, styles.ctaText]}>complete sign up →</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={[typography.caption, styles.lab]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={tokens.textSecondary}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { paddingHorizontal: spacing.md, gap: spacing.sm },
  h: { color: tokens.text, marginBottom: spacing.md },
  lab: { color: tokens.textSecondary, marginBottom: 4 },
  input: {
    backgroundColor: tokens.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    padding: 12,
    color: tokens.text,
  },
  select: {
    backgroundColor: tokens.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    padding: 12,
  },
  opt: { paddingVertical: 8, paddingHorizontal: 4 },
  cta: { marginTop: spacing.lg, alignSelf: 'center' },
  ctaText: { color: tokens.text, textDecorationLine: 'underline' },
});
