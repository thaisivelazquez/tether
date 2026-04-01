import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillToggle, type FeedFilter } from '../../components/PillToggle';
import { SidequestCard } from '../../components/SidequestCard';
import { spacing, tokens, typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sidequests } = useApp();
  const [filter, setFilter] = useState<FeedFilter>('all');

  const data = useMemo(() => {
    if (filter === 'all') return sidequests;
    return sidequests.filter(
      (s) =>
        s.visibility === 'close-friends' || s.postedBy.ringLevel === 'close-friends',
    );
  }, [filter, sidequests]);

  return (
    <View style={[styles.flex, { paddingTop: insets.top + spacing.md }]}>
      <Text style={[typography.heading, styles.header]}>what&apos;s everyone up to this week?</Text>
      <View style={styles.toggle}>
        <PillToggle value={filter} onChange={setFilter} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => (
          <SidequestCard
            sidequest={item}
            onPress={() => router.push(`/modals/sidequest/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingHorizontal: spacing.md },
  header: { color: tokens.text, marginBottom: spacing.md },
  toggle: { marginBottom: spacing.md },
});
