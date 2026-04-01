import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { tokens } from '../constants/theme';

type Props = {
  onPress: () => void;
  bottomOffset?: number;
};

export function FAB({ onPress, bottomOffset = 96 }: Props) {
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: bottomOffset }]}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
        <Ionicons name="add" size={32} color={tokens.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: tokens.accent,
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pressed: {
    opacity: 0.9,
  },
});
