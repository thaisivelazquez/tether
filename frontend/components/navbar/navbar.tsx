import { Href, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AddEvent from './addevent.svg';
import BellUnselected from './bellunselected.svg';
import CircleiconSelected from './circleiconselected.svg';
import CircleiconUnselected from './circleiconunselected.svg';
import HomeiconSelected from './homeiconselected.svg';
import HomeiconUnselected from './homeiconunselected.svg';
import PficonSelected from './pficonselected.svg';
import PficonUnselected from './pficonunselected.svg';

export type NavTabId = 'home' | 'circle' | 'add' | 'bell' | 'profile';

interface NavbarProps {
  activeTab: NavTabId;
  setActiveTab: (id: NavTabId) => void;
  onAddPress: () => void;
}

export const Navbar = ({ activeTab, setActiveTab, onAddPress }: NavbarProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleTabPress = (tab: NavTabId) => {
    setActiveTab(tab);

    let route: Href | null = null;

    switch (tab) {
      case 'home':
        route = '/homepage';
        break;
      case 'circle':
        route = '/circle';
        break;
      case 'bell':
        route = null;
        break;
      case 'profile':
        route = '/myprofile';
        break;
      case 'add':
        route = null;
        break;
      default:
        route = null;
        break;
    }

    if (route) {
      router.push(route);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom + 8,
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: 'transparent',
      }}
    >
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingVertical: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Pressable onPress={() => handleTabPress('home')} style={{ padding: 6 }}>
          {activeTab === 'home' ? <HomeiconSelected /> : <HomeiconUnselected />}
        </Pressable>

        <Pressable onPress={() => handleTabPress('circle')} style={{ padding: 6 }}>
          {activeTab === 'circle' ? <CircleiconSelected /> : <CircleiconUnselected />}
        </Pressable>

        <Pressable
          onPress={onAddPress}
          style={{
            backgroundColor: '#e8e4ff',
            borderRadius: 999,
            width: 52,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AddEvent />
        </Pressable>

        <Pressable onPress={() => handleTabPress('bell')} style={{ padding: 6 }}>
          <BellUnselected />
        </Pressable>

        <Pressable onPress={() => handleTabPress('profile')} style={{ padding: 6 }}>
          {activeTab === 'profile' ? <PficonSelected /> : <PficonUnselected />}
        </Pressable>
      </View>
    </View>
  );
};