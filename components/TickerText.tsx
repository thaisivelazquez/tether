import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { tokens, typography } from '../constants/theme';

type Props = {
  lines: string[];
};

const LINE = 30;

export function TickerText({ lines }: Props) {
  const y = useRef(new Animated.Value(0)).current;
  const block = lines.length * LINE;

  useEffect(() => {
    y.setValue(0);
    const anim = Animated.loop(
      Animated.timing(y, {
        toValue: -block,
        duration: Math.max(12000, block * 90),
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [block, y]);

  const seq = [...lines, ...lines];

  return (
    <View style={styles.clip}>
      <Animated.View style={{ transform: [{ translateY: y }] }}>
        {seq.map((line, i) => (
          <Text key={`${i}-${line}`} style={[typography.caption, styles.line]}>
            {line}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    height: 120,
    overflow: 'hidden',
  },
  line: {
    color: tokens.text,
    opacity: 0.85,
    height: LINE,
    lineHeight: LINE,
  },
});
