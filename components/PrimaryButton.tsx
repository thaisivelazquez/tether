import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { tokens, typography } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'fill' | 'outline' | 'danger';
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, variant = 'fill', style }: Props) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.fill,
        isDanger && !isOutline ? styles.danger : null,
        pressed && { opacity: 0.88 },
        style,
      ]}
    >
      <Text
        style={[
          typography.subheading,
          styles.label,
          isOutline ? { color: tokens.text } : isDanger ? { color: tokens.onDanger } : { color: tokens.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  fill: {
    backgroundColor: tokens.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: tokens.text,
  },
  danger: {
    backgroundColor: tokens.dangerBackground,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
