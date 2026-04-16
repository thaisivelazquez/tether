import 'react-native-gesture-handler';

import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProvider } from '../context/AppContext';
import { TutorialProvider } from '../context/TutorialContext';
import { activeGradient } from '../constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <AppProvider>
	<TutorialProvider>
		<LinearGradient colors={[activeGradient[0], activeGradient[1]]} style={styles.flex}>
          		<StatusBar style="dark" />
          		<Stack screenOptions={{ headerShown: false }}>
            		   <Stack.Screen name="index" />
            		   <Stack.Screen name="(auth)" />
            		   <Stack.Screen name="(tabs)" />
            		   <Stack.Screen name="modals" options={{ presentation: 'modal', headerShown: false }} />
          		</Stack>
        	</LinearGradient>
      	</TutorialProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
