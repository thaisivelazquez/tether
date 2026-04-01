import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TickerText } from '../../components/TickerText';
import { tickerPhrases } from '../../constants/mockData';
import { spacing, tokens, typography } from '../../constants/theme';

export default function WelcomePhone() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');

  const submit = () => {
    const display = `+1 ${phone.trim() || '555-123-4567'}`;
    router.push({ pathname: '/(auth)/verify', params: { phone: display } });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { paddingTop: insets.top + spacing.lg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.corner} />
      <View style={styles.body}>
        <Text style={[typography.heading, styles.title]}>Tether</Text>
        <Text style={[typography.body, styles.tagline]}>
          Less time planning, more time together.
        </Text>
        <View style={styles.row}>
          <Text style={[typography.body, styles.flag]}>🇺🇸</Text>
          <Text style={[typography.caption, styles.dd]}>▾</Text>
          <TextInput
            style={[typography.body, styles.input]}
            placeholder="Phone number"
            placeholderTextColor={tokens.textSecondary}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <Pressable onPress={submit} style={styles.linkWrap}>
          <Text style={[typography.subheading, styles.link]}>sign up/log in →</Text>
        </Pressable>
      </View>
      <TickerText lines={tickerPhrases} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingHorizontal: spacing.md },
  corner: {
    position: 'absolute',
    right: -40,
    top: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    textAlign: 'center',
    color: tokens.text,
  },
  tagline: {
    textAlign: 'center',
    color: tokens.text,
    opacity: 0.85,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    paddingHorizontal: spacing.sm,
  },
  flag: { fontSize: 22, marginRight: 4 },
  dd: { marginRight: spacing.sm, color: tokens.textSecondary },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: tokens.text,
  },
  linkWrap: { alignSelf: 'center', marginTop: spacing.md },
  link: { color: tokens.text, textDecorationLine: 'underline' },
});
