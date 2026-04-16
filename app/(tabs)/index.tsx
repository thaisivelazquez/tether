import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillToggle, type FeedFilter } from '../../components/PillToggle';
import { SidequestCard } from '../../components/SidequestCard';
import { spacing, tokens, typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { useTutorial } from '../../context/TutorialContext';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sidequests } = useApp();
  const { step, registerRef, measureAndSet } = useTutorial();
  const [filter, setFilter] = useState<FeedFilter>('all');

  // Ref wrapping the feed area for tutorial step 3
  const feedRef = useRef<View>(null);

  useEffect(() => {
    if (step === 'home') {
      const t = setTimeout(() => {
        registerRef(feedRef);
        measureAndSet();
      }, 350);
      return () => clearTimeout(t);
    }
  }, [step]);

  const data = useMemo(() => {
    if (filter === 'all') return sidequests;
    return sidequests.filter(
      (s) => s.visibility === 'close-friends' || s.postedBy.ringLevel === 'close-friends',
    );
  }, [filter, sidequests]);

  return (
    <View style={[styles.flex, { paddingTop: insets.top + spacing.md }]}>
     <View ref={feedRef} collapsable={false}>
      <Text style={[typography.heading, styles.header]}>
        what&apos;s everyone up to this week?
      </Text>
      <View style={styles.toggle}>
        <PillToggle value={filter} onChange={setFilter} />
      </View>
     </View>

      {/* Highlighted area for tutorial step 3 */}
      <View style={styles.feedWrap}>
        <FlatList
          data={data}
          keyExtractor={(x) => x.id}
          contentContainerStyle={{ paddingBottom: 140 }}
          scrollEnabled={step !== 'home'} // lock scroll during tutorial
          renderItem={({ item }) => (
            <SidequestCard
              sidequest={item}
              onPress={() => router.push(`/modals/sidequest/${item.id}`)}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingHorizontal: spacing.md },
  header: { color: tokens.text, marginBottom: spacing.md },
  toggle: { marginBottom: spacing.md },
  feedWrap: { flex: 1 },
});
