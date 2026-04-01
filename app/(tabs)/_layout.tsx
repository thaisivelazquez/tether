import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FAB } from '../../components/FAB';
import { tokens } from '../../constants/theme';

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.flex}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: tokens.text,
          tabBarInactiveTintColor: tokens.textSecondary,
          tabBarStyle: {
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderTopColor: tokens.border,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="circle"
          options={{
            title: 'Circle',
            tabBarIcon: ({ color, size }) => <Ionicons name="radio-button-on" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
          }}
        />
      </Tabs>
      <FAB bottomOffset={insets.bottom + 72} onPress={() => router.push('/modals/create')} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
