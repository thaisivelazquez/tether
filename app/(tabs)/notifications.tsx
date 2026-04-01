import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationRow } from '../../components/NotificationRow';
import { spacing, tokens, typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notifications, setNotifications } = useApp();

  const data = useMemo(
    () => [...notifications].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [notifications],
  );

  return (
    <View style={[styles.flex, { paddingTop: insets.top + spacing.md }]}>
      <Text style={[typography.heading, styles.title]}>Notifications</Text>
      <FlatList
        data={data}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <NotificationRow
            notification={item}
            onPress={() => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
              );
              router.push(`/modals/sidequest/${item.sidequest.id}`);
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingHorizontal: spacing.md },
  title: { textAlign: 'center', color: tokens.text, marginBottom: spacing.md },
});
