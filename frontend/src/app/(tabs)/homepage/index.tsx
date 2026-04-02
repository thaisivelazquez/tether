import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Allbutton from '../../../components/homepage/allbuttons.svg';
import Closefriendsbutton from '../../../components/homepage/closefriendsbutton.svg';
import { styles } from '../../../components/homepage/homepagestyles';
import AddEvent from '../../../components/navbar/addevent.svg';
import BellUnselected from '../../../components/navbar/bellunselected.svg';
import CircleiconSelected from '../../../components/navbar/circleiconselected.svg';
import CircleiconUnselected from '../../../components/navbar/circleiconunselected.svg';
import HomeiconSelected from '../../../components/navbar/homeiconselected.svg';
import HomeiconUnselected from '../../../components/navbar/homeiconunselected.svg';
import PficonSelected from '../../../components/navbar/pficonselected.svg';
import PficonUnselected from '../../../components/navbar/pficonunselected.svg';
import { SidequestCard } from '../../../components/sidequest/sidequestcard';

/** -------------------------------
 * Types
 * ------------------------------- */
type RingLevel = 'friends' | 'close-friends';
type User = {
  id: string;
  name: string;
  ringLevel: RingLevel;
  avatar: string;
  handle: string;
  location: string;
  status: string;
};

type Sidequest = {
  id: string;
  title: string;
  description: string;
  visibility: 'close-friends' | 'everyone';
  postedBy: User;
  attendees: User[];
  createdAt: string;
  startTime: string;
  endTime: string;
  location: string;
  maxAttendees: number;
};

/** -------------------------------
 * Mock data
 * ------------------------------- */
const mockUsers: User[] = [
  { id: 'u1', name: 'Alice', ringLevel: 'close-friends', avatar: '👩', handle: '@alice', location: 'NYC', status: 'Hey there!' },
  { id: 'u2', name: 'Bob', ringLevel: 'friends', avatar: '🧑', handle: '@bob', location: 'SF', status: 'Ready to party!' },
];

const now = new Date();
const mockSidequests: Sidequest[] = [
  {
    id: 'sq1',
    title: 'Go Hiking',
    description: 'A fun hike in the mountains.',
    visibility: 'close-friends',
    postedBy: mockUsers[0],
    attendees: [],
    createdAt: now.toISOString(),
    startTime: new Date(now.getTime() + 3600_000).toISOString(),
    endTime: new Date(now.getTime() + 3 * 3600_000).toISOString(),
    location: 'Bear Mountain',
    maxAttendees: 5,
  },
  {
    id: 'sq2',
    title: 'Board Game Night',
    description: 'Fun board games at my place.',
    visibility: 'everyone',
    postedBy: mockUsers[1],
    attendees: [],
    createdAt: now.toISOString(),
    startTime: new Date(now.getTime() + 7200_000).toISOString(),
    endTime: new Date(now.getTime() + 4 * 3600_000).toISOString(),
    location: "Bob's apartment",
    maxAttendees: 8,
  },
];

/** -------------------------------
 * AppContext
 * ------------------------------- */
type AppContextValue = { sidequests: Sidequest[] };
const AppContext = createContext<AppContextValue | null>(null);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sidequests] = useState<Sidequest[]>(mockSidequests);
  return <AppContext.Provider value={{ sidequests }}>{children}</AppContext.Provider>;
};

const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

/** -------------------------------
 * Navbar
 * ------------------------------- */
type NavTabId = 'home' | 'circle' | 'add' | 'bell' | 'profile';

const BottomNavbar = ({ activeTab, setActiveTab }: { activeTab: NavTabId; setActiveTab: (id: NavTabId) => void }) => {
  const insets = useSafeAreaInsets();

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
        <Pressable onPress={() => setActiveTab('home')} style={{ padding: 6 }}>
          {activeTab === 'home' ? <HomeiconSelected /> : <HomeiconUnselected />}
        </Pressable>

        <Pressable onPress={() => setActiveTab('circle')} style={{ padding: 6 }}>
          {activeTab === 'circle' ? <CircleiconSelected /> : <CircleiconUnselected />}
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('add')}
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

        <Pressable onPress={() => setActiveTab('bell')} style={{ padding: 6 }}>
          <BellUnselected />
        </Pressable>

        <Pressable onPress={() => setActiveTab('profile')} style={{ padding: 6 }}>
          {activeTab === 'profile' ? <PficonSelected /> : <PficonUnselected />}
        </Pressable>
      </View>
    </View>
  );
};

/** -------------------------------
 * Homepage
 * ------------------------------- */
export default function HomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const whiteOverlay = useRef(new Animated.Value(1)).current;
  const [filter, setFilter] = useState<'all' | 'close-friends'>('all');
  const [activeTab, setActiveTab] = useState<NavTabId>('home');

  return (
    <AppProvider>
      <InnerHomePage
        filter={filter}
        setFilter={setFilter}
        whiteOverlay={whiteOverlay}
        insets={insets}
        router={router}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </AppProvider>
  );
}

const InnerHomePage = ({ filter, setFilter, whiteOverlay, insets, router, activeTab, setActiveTab }: any) => {
  const { sidequests } = useApp();

  const data = useMemo(() => {
    let filtered = sidequests;
    if (filter === 'close-friends') {
      filtered = sidequests.filter(
        (s) => s.visibility === 'close-friends' || s.postedBy?.ringLevel === 'close-friends'
      );
    }
    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter, sidequests]);

  useEffect(() => {
    Animated.timing(whiteOverlay, {
      toValue: 0,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.slide}>
          <View style={styles.formBlock}>
            <Text style={styles.formHeadline}>
              what's everyone{'\n'}up to this week?
            </Text>
            <View style={styles.buttonRow}>
              <Pressable onPress={() => setFilter('all')} style={{ opacity: filter === 'all' ? 1 : 0.5 }}>
                <Allbutton style={styles.allfriendsBtn} />
              </Pressable>
              <Pressable onPress={() => setFilter('close-friends')} style={{ opacity: filter === 'close-friends' ? 1 : 0.5 }}>
                <Closefriendsbutton style={styles.closefriendsBtn} />
              </Pressable>
            </View>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 140, flexGrow: 1 }}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>no sidequests yet 👀</Text>}
            renderItem={({ item }) => (
              <SidequestCard
                sidequest={item}
                onPress={() => router.push(`/sidequest/${item.id}`)}
              />
            )}
          />
        </View>
      </SafeAreaView>

      <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          opacity: whiteOverlay,
        }}
      />
    </View>
  );
};