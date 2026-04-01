import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

import { PrimaryButton } from '../../components/PrimaryButton';
import { TickerText } from '../../components/TickerText';
import { tickerPhrases } from '../../constants/mockData';
import { spacing, tokens, typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function Verify() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const { isFirstTime } = useApp();
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const submit = () => {
    if (code.length !== 7) return;
    if (isFirstTime) router.replace('/(auth)/carousel');
    else router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { paddingTop: insets.top + spacing.lg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.corner} />
      <View style={styles.body}>
        <Text style={[typography.heading, styles.h]}>Verify your number</Text>
        <Text style={[typography.body, styles.sub]}>
          Enter the OTP sent to {phone ?? '+1 XXX-XXX-XXXX'}.
        </Text>
        <TextInput
          style={[typography.heading, styles.otp]}
          placeholder="— — — — — — —"
          placeholderTextColor={tokens.textSecondary}
          keyboardType="number-pad"
          maxLength={7}
          value={code}
          onChangeText={setCode}
        />
        <PrimaryButton label="continue →" onPress={submit} />
        <Pressable
          onPress={() => seconds === 0 && setSeconds(30)}
          disabled={seconds > 0}
          style={styles.resend}
        >
          <Text style={[typography.caption, { color: tokens.textSecondary }]}>
            {seconds > 0 ? `Resend code in ${seconds} seconds.` : 'Tap to resend code.'}
          </Text>
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
  body: { flex: 1, justifyContent: 'center', gap: spacing.md },
  h: { color: tokens.text },
  sub: { color: tokens.text, opacity: 0.85 },
  otp: {
    letterSpacing: 6,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: tokens.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    color: tokens.text,
  },
  resend: { alignSelf: 'center', marginTop: spacing.sm },
});
