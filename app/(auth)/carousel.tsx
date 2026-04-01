import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { SidequestCard } from '../../components/SidequestCard';
import { spacing, tokens, typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const { width: W } = Dimensions.get('window');

export default function Carousel() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sidequests } = useApp();
  const [page, setPage] = useState(0);
  const scroll = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setPage(Math.round(x / W));
  };

  const preview = sidequests.slice(0, 2);

  return (
    <View style={[styles.flex, { paddingTop: insets.top + spacing.md }]}>
      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={[styles.page, { width: W }]}>
          <Text style={styles.doodle}>☀️ 🌿 ✏️</Text>
          <Text style={[typography.subheading, styles.center]}>
            Life gets busy. But seeing friends shouldn&apos;t be this hard.
          </Text>
        </View>
        <View style={[styles.page, { width: W }]}>
          <Text style={styles.doodle}>◯ ◎</Text>
          <Text style={[typography.body, styles.center]}>
            Everyone you care about is already in your circle. tether helps you bring them into
            your day. ☀️
          </Text>
        </View>
        <View style={[styles.page, { width: W }]}>
          {preview.map((s) => (
            <View key={s.id} style={{ marginBottom: spacing.sm }}>
              <SidequestCard sidequest={s} onPress={() => {}} />
            </View>
          ))}
          <Text style={[typography.subheading, styles.center]}>
            No big plans needed. Just some sidequests and the right people.
          </Text>
          <PrimaryButton
            label="get started →"
            onPress={() => router.replace('/(auth)/profile-setup')}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, page === i && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: {
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  doodle: { textAlign: 'center', fontSize: 42 },
  center: { textAlign: 'center', color: tokens.text },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: spacing.xl,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.2)' },
  dotOn: { backgroundColor: tokens.text },
});
