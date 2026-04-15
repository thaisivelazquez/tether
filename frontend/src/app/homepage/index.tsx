import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Allbutton from '../../../components/homepage/allbuttons.svg';
import Closefriendsbutton from '../../../components/homepage/closefriendsbutton.svg';
import { styles } from '../../../components/homepage/homepagestyles';
import { Navbar, NavTabId } from '../../../components/navbar/navbar';
import CreateSidequestForm from '../modals/sidequest/create';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DISMISS_THRESHOLD = 120;

// ─── Types ────────────────────────────────────────────────────────────────────

type Attendee = {
  id: string;
  name: string;
  location: string;
};

type Sidequest = {
  id: string;
  title: string;
  description: string;
  circleStatus: 'everyone' | 'close-friends';
  postedBy: {
    id: string;
    name: string;
    location: string;
  };
  attendees: Attendee[];
  startTime: string;
  endTime: string;
  location: string;
  maxAttendees: number;
};

// ─── SidequestCard ────────────────────────────────────────────────────────────

function SidequestCard({
  sidequest,
  onPress,
}: {
  sidequest: Sidequest;
  onPress: () => void;
}) {
  const start = new Date(sidequest.startTime);
  const end = new Date(sidequest.endTime);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDate = (d: Date) =>
    d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const isCloseFriends = sidequest.circleStatus === 'close-friends';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardStyles.card, pressed && { opacity: 0.8 }]}
    >
      {/* Title + badge */}
      <View style={cardStyles.headerRow}>
        <Text style={cardStyles.title} numberOfLines={1}>
          {sidequest.title}
        </Text>
        <View style={[cardStyles.badge, isCloseFriends ? cardStyles.badgeCF : cardStyles.badgeAll]}>
          <Text style={cardStyles.badgeText}>
            {isCloseFriends ? '🔒 close friends' : '🌍 everyone'}
          </Text>
        </View>
      </View>

      {/* Description */}
      {sidequest.description ? (
        <Text style={cardStyles.desc} numberOfLines={2}>
          {sidequest.description}
        </Text>
      ) : null}

      {/* Date & time */}
      <View style={cardStyles.metaRow}>
        <Text style={cardStyles.meta}>📅 {formatDate(start)}</Text>
        <Text style={cardStyles.metaDot}>·</Text>
        <Text style={cardStyles.meta}>
          ⏰ {formatTime(start)} – {formatTime(end)}
        </Text>
      </View>

      {/* Location & capacity */}
      <View style={cardStyles.metaRow}>
        <Text style={cardStyles.meta}>📍 {sidequest.location}</Text>
        <Text style={cardStyles.metaDot}>·</Text>
        <Text style={cardStyles.meta}>
          👥 {sidequest.attendees.length}/{sidequest.maxAttendees}
        </Text>
      </View>

      {/* Posted by */}
      <Text style={cardStyles.poster}>posted by {sidequest.postedBy.name}</Text>
    </Pressable>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const whiteOverlay = useRef(new Animated.Value(1)).current;

  const [filter, setFilter] = useState<'all' | 'close-friends'>('all');
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidequests, setSidequests] = useState<Sidequest[]>([]);

  const fetchSidequests = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) {
        console.warn('No user_id in storage — not fetching sidequests');
        return;
      }

      const baseUrl =
        Platform.OS === 'web'
          ? 'http://localhost:3000'
          : 'http://192.168.1.XX:3000'; // ← replace with your local IP

      const res = await fetch(`${baseUrl}/events?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSidequests(data);
      } else {
        console.error('Fetch sidequests failed:', res.status);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  }, []);

  // Re-fetch every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchSidequests();
    }, [fetchSidequests])
  );

  // Fade in on mount
  useEffect(() => {
    Animated.timing(whiteOverlay, {
      toValue: 0,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredData = useMemo(() => {
    if (filter === 'close-friends') {
      return sidequests.filter((s) => s.circleStatus === 'close-friends');
    }
    return sidequests; // already sorted DESC by the backend
  }, [filter, sidequests]);

  // Called after a successful form submit — close sheet then refresh list
  const handleSidequestCreated = useCallback(() => {
    setSheetOpen(false);
    fetchSidequests();
  }, [fetchSidequests]);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.slide}>
          {/* Header */}
          <View style={styles.formBlock}>
            <Text style={styles.formHeadline}>
              what's everyone{'\n'}up to this week?
            </Text>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => setFilter('all')}
                style={{ opacity: filter === 'all' ? 1 : 0.5 }}
              >
                <Allbutton style={styles.allfriendsBtn} />
              </Pressable>
              <Pressable
                onPress={() => setFilter('close-friends')}
                style={{ opacity: filter === 'close-friends' ? 1 : 0.5 }}
              >
                <Closefriendsbutton style={styles.closefriendsBtn} />
              </Pressable>
            </View>
          </View>

          {/* Sidequest list */}
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingBottom: 140,
              flexGrow: 1,
              paddingHorizontal: 16,
            }}
            ListEmptyComponent={
              <Text style={localStyles.emptyText}>no sidequests yet 👀</Text>
            }
            renderItem={({ item }) => (
              <SidequestCard
                sidequest={item}
                onPress={() => router.push(`/sidequest/${item.id}` as any)}
              />
            )}
          />
        </View>
      </SafeAreaView>

      {/* Bottom sheet */}
      <AddSidequestSheet
        visible={sheetOpen}
        onClose={handleSidequestCreated}
        onCancel={() => setSheetOpen(false)}
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

// ─── AddSidequestSheet ────────────────────────────────────────────────────────

function AddSidequestSheet({
  visible,
  onClose,
  onCancel,
}: {
  visible: boolean;
  onClose: () => void;  // successful submit
  onCancel: () => void; // dismissed without submitting
}) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 1.5) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(onCancel);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <Pressable style={localStyles.backdrop} onPress={onCancel} />
      <Animated.View style={[localStyles.sheetContainer, { transform: [{ translateY }] }]}>
        <View {...panResponder.panHandlers} style={localStyles.handleArea}>
          <View style={localStyles.handle} />
        </View>
        <CreateSidequestForm onClose={onClose} />
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
  whiteOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
    fontSize: 14,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
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

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeCF: { backgroundColor: '#2d1f3d' },
  badgeAll: { backgroundColor: '#1a2d1f' },
  badgeText: {
    color: '#c8b1db',
    fontSize: 11,
    fontWeight: '600',
  },
  desc: {
    color: '#999',
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  meta: { color: '#777', fontSize: 12 },
  metaDot: { color: '#444', fontSize: 12 },
  poster: {
    color: '#555',
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
});