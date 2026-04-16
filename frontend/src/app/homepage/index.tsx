import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (d: Date) =>
  d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

const getBaseUrl = () =>
  Platform.OS === 'web'
    ? 'http://localhost:3000' //change for app 
    : 'http://172.19.3.53:3000'; // change for app

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
  const isCloseFriends = sidequest.circleStatus === 'close-friends';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardStyles.card, pressed && { opacity: 0.8 }]}
    >
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

      {sidequest.description ? (
        <Text style={cardStyles.desc} numberOfLines={2}>
          {sidequest.description}
        </Text>
      ) : null}

      <View style={cardStyles.metaRow}>
        <Text style={cardStyles.meta}>📅 {formatDate(start)}</Text>
      </View>
      <View style={cardStyles.metaRow}>
        <Text style={cardStyles.meta}>⏰ {formatTime(start)} – {formatTime(end)}</Text>
        <Text style={cardStyles.metaDot}>·</Text>
        <Text style={cardStyles.meta}>👥 {sidequest.attendees.length}/{sidequest.maxAttendees}</Text>
      </View>
      <View style={cardStyles.metaRow}>
        <Text style={cardStyles.meta}>📍 {sidequest.location}</Text>
      </View>

      <Text style={cardStyles.poster}>posted by {sidequest.postedBy.name}</Text>
    </Pressable>
  );
}

// ─── SidequestDetailModal ─────────────────────────────────────────────────────

function SidequestDetailModal({
  sidequest,
  currentUserId,
  onClose,
  onDeleted,
}: {
  sidequest: Sidequest | null;
  currentUserId: string | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [deleting, setDeleting] = useState(false);

  const isOwner =
    !!sidequest &&
    !!currentUserId &&
    String(sidequest.postedBy.id) === String(currentUserId);

  useEffect(() => {
    if (sidequest) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [sidequest]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // ✅ IMPORTANT FIX
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 1.5) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(onClose);
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

  const handleDelete = async () => {
    if (!sidequest) return;

    if (!currentUserId) {
      Alert.alert("Error", "User not loaded yet. Try again.");
      return;
    }

    console.log("🗑 DELETE CLICKED", {
      sidequestId: sidequest.id,
      currentUserId,
      postedBy: sidequest.postedBy.id,
    });

    setDeleting(true);

    try {
      const res = await fetch(
        `${getBaseUrl()}/events/${sidequest.id}?user_id=${encodeURIComponent(
          currentUserId
        )}`,
        { method: "DELETE" }
      );

      const text = await res.text();
      console.log("🧾 DELETE RESPONSE:", res.status, text);

      if (!res.ok) {
        Alert.alert("Error", text || "Delete failed");
        return;
      }

      onDeleted(sidequest.id);
      onClose(); 
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error while deleting");
    } finally {
      setDeleting(false);
    }
  };

  if (!sidequest) return null;

  const start = new Date(sidequest.startTime);
  const end = new Date(sidequest.endTime);
  const isCloseFriends = sidequest.circleStatus === "close-friends";

  return (
    <Modal transparent visible={!!sidequest} animationType="none">
      <View style={{ flex: 1 }}>
        {/* BACKDROP */}
        <Pressable style={localStyles.backdrop} onPress={onClose} />

        {/* SHEET */}
        <Animated.View
          style={[
            localStyles.sheetContainer,
            { transform: [{ translateY }] },
          ]}
        >
          <View style={localStyles.handleArea} {...panResponder.panHandlers}>
            <View style={localStyles.handle} />
          </View>

          <ScrollView
           contentContainerStyle={{
  paddingBottom: 140,
  flexGrow: 1,
  paddingHorizontal: 16,
  paddingTop: 12, // ✅ adds gap between buttons + cards
}}
          >
            <Text style={{ color: "#fff", fontSize: 22 }}>
              {sidequest.title}
            </Text>

            <Text style={{ color: "#777", marginTop: 4 }}>
              posted by {sidequest.postedBy.name}
            </Text>

            <Text style={{ color: "#ccc", marginTop: 12 }}>
              📍 {sidequest.location}
            </Text>

            {/* DELETE BUTTON */}
            {isOwner && (
              <Pressable
                onPress={handleDelete}
                disabled={deleting}
                style={{
                  marginTop: 40,
                  padding: 14,
                  backgroundColor: "#2d1010",
                  borderRadius: 12,
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                <Text style={{ color: "#ff4d4d", textAlign: "center" }}>
                  {deleting ? "Deleting..." : "🗑 Delete Sidequest"}
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
 

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const whiteOverlay = useRef(new Animated.Value(1)).current;

  const [filter, setFilter] = useState<'all' | 'close-friends'>('all');
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidequests, setSidequests] = useState<Sidequest[]>([]);
  const [selectedSidequest, setSelectedSidequest] = useState<Sidequest | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('user_id').then((id) => setCurrentUserId(id));
  }, []);

  const fetchSidequests = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId) return;

      const res = await fetch(`${getBaseUrl()}/events?user_id=${userId}`);
      if (res.ok) {
  const data = await res.json();
  console.log('✅ first event postedBy.id:', data[0]?.postedBy?.id);
  console.log('✅ currentUserId from storage:', userId);
  setSidequests(data);
} 
    } catch (err) {
      console.error('Fetch failed:', err);
    } 
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSidequests();
    }, [fetchSidequests])
  );

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
    return sidequests;
  }, [filter, sidequests]);

  const handleSidequestCreated = useCallback(() => {
    setSheetOpen(false);
    fetchSidequests();
  }, [fetchSidequests]);

 
  function handleSidequestDeleted(deletedId: string) {
    setSidequests((prev) => prev.filter((s) => s.id !== deletedId));
    setSelectedSidequest(null);
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.slide}>
         <View style={[styles.formBlock, { marginBottom: 16 }]}>
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

          {/* ✅ extraData forces re-render when list changes */}
          <FlatList
            data={filteredData}
            extraData={filteredData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingBottom: 140,
              flexGrow: 1,
              paddingHorizontal: 16,
            }}
            ListEmptyComponent={
              <Text style={localStyles.emptyText}>no sidequests yet, why not create one?</Text>
            }
            renderItem={({ item }) => (
              <SidequestCard
                sidequest={item}
                onPress={() => setSelectedSidequest(item)}
              />
            )}
          />
        </View>
      </SafeAreaView>

      <SidequestDetailModal
        sidequest={selectedSidequest}
        currentUserId={currentUserId}
        onClose={() => setSelectedSidequest(null)}
        onDeleted={handleSidequestDeleted}
      />

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
  onClose: () => void;
  onCancel: () => void;
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

const detailStyles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 32,
  },
  postedBy: {
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 16,
  },
  value: {
    color: '#ccc',
    fontSize: 15,
    marginBottom: 4,
    lineHeight: 22,
  },
  description: {
    color: '#aaa',
    fontSize: 15,
    lineHeight: 22,
  },
  attendee: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  deleteBtn: {
    marginTop: 40,
    borderWidth: 1,
    borderColor: '#5c1f1f',
    backgroundColor: '#2d1010',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#e05555',
    fontSize: 15,
    fontWeight: '600',
  },
});