import { StyleSheet, Text, View } from 'react-native';

import { tokens } from '../constants/theme';

type Props = {
  label: string;
  size?: number;
};

export function UserAvatar({ label, size = 40 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.emoji, { fontSize: size * 0.45 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: tokens.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.border,
  },
  emoji: {
    textAlign: 'center',
  },
});
