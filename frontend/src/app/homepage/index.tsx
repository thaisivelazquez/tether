import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Assets & Styles
import Allbutton from '../../../components/homepage/allbuttons.svg';
import Closefriendsbutton from '../../../components/homepage/closefriendsbutton.svg';
import { styles } from '../../../components/homepage/homepagestyles';
import { Navbar, NavTabId } from '../../../components/navbar/navbar';

// ✅ IMPORT YOUR FORM COMPONENT
// Adjust the path to where your create.tsx file lives
import CreateSidequestForm from '../modals/sidequest/create';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DISMISS_THRESHOLD = 120;

/** -------------------------------
 * Types (Matching your DB Schema)
 * ------------------------------- */
type Sidequest = {
  id: string;
  user_id: string;
  event_title: string;
  event_des: string;
  time_of_event: string;
  time_event_end: string;
  location: string;
  max_attendees: number;
  circle_status: 'everyone' | 'close-friends';
  poster_first_name?: string;
  poster_last_name?: string;
};

/** -------------------------------
 * Homepage Component
 * ------------------------------- */
export default function HomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const whiteOverlay = useRef(new Animated.Value(1)).current;

  const [filter, setFilter] = useState<'all' | 'close-friends'>('all');
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidequests, setSidequests] = useState<Sidequest[]>([]);

  // ✅ REFRESH LOGIC: Fetch from DB whenever the screen is focused
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchSidequests = async () => {
        try {
          // Use your computer's local IP for physical devices!
          const baseUrl = Platform.OS === 'web' ? 'http://localhost:3000' : 'http://192.168.1.XX:3000';
          const res = await fetch(`${baseUrl}/events`);
          if (res.ok && isMounted) {
            const data = await res.json();
            setSidequests(data);
          }
        } catch (err) {
          console.error("Fetch failed:", err);
        }
      };
      fetchSidequests();
      return () => { isMounted = false; };
    }, [])
  );

  const filteredData = useMemo(() => {
    let data = sidequests;
    if (filter === 'close-friends') {
      data = sidequests.filter((s) => s.circle_status === 'close-friends');
    }
    return [...data].sort((a, b) => new Date(b.time_of_event).getTime() - new Date(a.time_of_event).getTime());
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

          {/* <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 140, flexGrow: 1 }}
            ListEmptyComponent={<Text style={localStyles.emptyText}>no sidequests yet 👀</Text>}
            renderItem={({ item }) => (
              <SidequestCard
                sidequest={item}
                onPress={() => router.push(`/sidequest/${item.id}`)}
              />
            )}
          /> */}
        </View>
      </SafeAreaView>

      {/* ✅ ADD SIDEQUEST SHEET (Modal) */}
      <AddSidequestSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddPress={() => setSheetOpen(true)}
      />

      <Animated.View
        pointerEvents="none"
        style={[localStyles.whiteOverlay, { opacity: whiteOverlay }]}
      />
    </View>
  );
}

/** -------------------------------
 * AddSidequestSheet Wrapper
 * ------------------------------- */
function AddSidequestSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [visible]);

  // Pan responder for drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => { if (dy > 0) translateY.setValue(dy); },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 1.5) {
          Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true }).start(onClose);
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
    })
  ).current;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={localStyles.backdrop} onPress={onClose} />
      <Animated.View style={[localStyles.sheetContainer, { transform: [{ translateY }] }]}>
        <View {...panResponder.panHandlers} style={localStyles.handleArea}>
           {/* Handle is now inside the Form component usually, but we keep it here for drag logic */}
           <View style={localStyles.handle} />
        </View>

        {/* ✅ RENDERING THE STANDALONE FORM COMPONENT */}
        <CreateSidequestForm onClose={onClose} />
        
      </Animated.View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  whiteOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleArea: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
  },
});