import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FAB } from '../../components/FAB';
import { TutorialOverlay } from '../../components/TutorialOverlay';
import { tokens } from '../../constants/theme';
import { useTutorial } from '../../context/TutorialContext';

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { step } = useTutorial();

  // When tutorial step changes, navigate to the correct tab
  useEffect(() => {
    if (step === 'circle') router.replace('/(tabs)/circle');
    if (step === 'home') router.replace('/(tabs)');
    // 'create' step is triggered from circle screen by opening the modal
  }, [step]);

  const showProfileBadge = step === 'done';

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
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="circle"
          options={{
            title: 'Circle',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="radio-button-on" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <View>
                <Ionicons name="person-outline" color={color} size={size} />
                {showProfileBadge && <View style={styles.badge} />}
              </View>
            ),
          }}
        />
      </Tabs>

      <FAB bottomOffset={insets.bottom + 72} onPress={() => router.push('/modals/create')} />

      {/* Tutorial overlay sits above everything inside the tab shell */}
      <TutorialOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
