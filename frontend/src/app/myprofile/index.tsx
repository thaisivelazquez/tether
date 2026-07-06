import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Clipboard from 'expo-clipboard';

import { Navbar, NavTabId } from '../../../components/navbar/navbar';
import CreateSidequestForm from '../modals/sidequest/create';

const EditButtonImg = require('../../../components/myprofile/editbutton.png');
const PfpImg = require('../../../components/myprofile/pfp.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 390;
const rs = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DISMISS_THRESHOLD = 120;

const getBaseUrl = () => {
  if (!__DEV__) return 'https://tether-production-c60a.up.railway.app';
  return Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://172.19.10.138:3000';
};

type Attendee = {
  id: string;
  name: string;
  location: string;
};
// ─── Time-based gradient background ────────────────────────────────────────

type ThemeSpec = {
  gradient: [string, string];
};

function getThemeForTime(date: Date = new Date()): ThemeSpec {
  const hour = date.getHours();

  // Daytime, 6AM–4PM
  if (hour >= 6 && hour < 16) {
    return {
      gradient: ['#fdf3e2', '#f3c48f'],
    };
  }

  // Afternoon/Sunset, 4PM–8PM
  if (hour >= 16 && hour < 20) {
    return {
      gradient: ['#d9d3f2', '#f6d9e6'],
    };
  }

  // Night, 8PM–6AM
  return {
    gradient: ['#17172f', '#242452'],
  };
}

function TimeGradientBackground() {
  const [theme, setTheme] = useState<ThemeSpec>(() => getThemeForTime());

  React.useEffect(() => {
    const id = setInterval(() => setTheme(getThemeForTime()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

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

function formatEventTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const isToday = start.toDateString() === now.toDateString();
  const isTomorrow = start.toDateString() === tomorrow.toDateString();
  const isEndTomorrow = end.toDateString() === tomorrow.toDateString();

  const startLabel = isToday
    ? 'Today'
    : isTomorrow
    ? 'Tomorrow'
    : start.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const endLabel = isEndTomorrow
    ? 'Tomorrow'
    : end.toDateString() === now.toDateString()
    ? formatTime(end)
    : end.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return `${startLabel}, ${formatTime(start)} – ${endLabel}`;
}

// ─── SidequestCard ────────────────────────────────────────────────────────────

function SidequestCard({
  sidequest,
  onPress,
}: {
  sidequest: Sidequest;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardStyles.card, pressed && { opacity: 0.85 }]}
    >
      {/* Top row: title + attendee count */}
      <View style={cardStyles.topRow}>
        <Text style={cardStyles.title} numberOfLines={2}>
          {sidequest.title}
        </Text>
        <View style={cardStyles.attendeeBadge}>
          <Text style={cardStyles.attendeeText}>
            👤 {sidequest.attendees?.length ?? 0}
            {sidequest.maxAttendees ? `/${sidequest.maxAttendees}` : ''}
          </Text>
        </View>
      </View>

      {/* Bottom row: location + time */}
      <View style={cardStyles.bottomRow}>
        <Text style={cardStyles.meta} numberOfLines={1}>
          📍 {sidequest.location || 'No location set'}
        </Text>
        <Text style={cardStyles.metaDivider}>·</Text>
        <Text style={cardStyles.meta} numberOfLines={1}>
          🕐 {formatEventTimeRange(sidequest.startTime, sidequest.endTime)}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<NavTabId>('profile');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidequests, setSidequests] = useState<Sidequest[]>([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [birthday, setBirthday] = useState('');
  const [bio, setBio] = useState('');

  const fetchSidequests = useCallback(async () => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      if (!id) return;

      const res = await fetch(`${getBaseUrl()}/events?user_id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mine = data.filter((sq: any) => sq.postedBy?.id === id);
          setSidequests(mine);
        }
      }
    } catch (err) {
      console.error('[fetchSidequests] Error:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const id = await AsyncStorage.getItem('user_id');
          if (!id) return;

          const res = await fetch(`${getBaseUrl()}/users/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFirstName(data.user.first_name || '');
            setLastName(data.user.last_name || '');
            setLocation(data.user.location || '');
            setBirthday(data.user.birthdate || '');
            setBio(data.user.bio || '');
          }
        } catch (err) {
          console.error('[loadUser] Error:', err);
        }
      };

      loadUser();
      fetchSidequests();
    }, [fetchSidequests])
  );

  const formatBirthday = (dateString: string | null) => {
    if (!dateString) return 'Add birthday';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const sortedSidequests = useMemo(() => {
    return [...sidequests].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }, [sidequests]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['user_id', 'token']);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    fetchSidequests();
  }, [fetchSidequests]);

  return (
  <View style={{ flex: 1 }}>
    <TimeGradientBackground />
    <SafeAreaView style={[profileStyles.container, { paddingTop: insets.top, backgroundColor: 'transparent' }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: rs(140) }}
        >
          {/* Top Bar */}
          <View style={profileStyles.topBar}>
            <Pressable
              onPress={() => router.push('/myprofile/edit')}
              style={profileStyles.editIconWrap}
            >
              <Image
                source={EditButtonImg}
                style={{ width: rs(22), height: rs(22) }}
                resizeMode="contain"
              />
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert('Log out', 'Are you sure you want to log out?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Log out', style: 'destructive', onPress: handleLogout },
                ])
              }
            >
              <Text style={profileStyles.logoutText}>LOG OUT</Text>
            </Pressable>
          </View>

          {/* Profile Hero */}
          <View style={profileStyles.hero}>
            <Image
              source={PfpImg}
              style={{ width: rs(136), height: rs(136) }}
              resizeMode="contain"
            />

            <Text style={profileStyles.name}>
              {firstName} {lastName}
            </Text>

            {!!bio && <Text style={profileStyles.infoText}>{bio}</Text>}

            <View style={profileStyles.infoRow}>
              <Text style={profileStyles.infoText}>📍 {location || 'Add location'}</Text>
              <Text style={profileStyles.infoText}>🎂 {formatBirthday(birthday)}</Text>
            </View>

            <Pressable
              style={profileStyles.shareBtn}
              onPress={async () => {
                const id = await AsyncStorage.getItem('user_id');
                const link = `exp://172.19.8.233:8081/--/profile/${id}`;
                try {
                  await Share.share({ message: `Check out my Tether profile! ${link}` });
                } catch {
                  await Clipboard.setStringAsync(link);
                  Alert.alert('Copied!', 'Profile link copied to clipboard.');
                }
              }}
            >
              <Text style={profileStyles.shareBtnText}>SHARE PROFILE</Text>
            </Pressable>
          </View>

          {/* Sidequests */}
          <View style={profileStyles.section}>
            <Text style={profileStyles.sectionTitle}>
              You are making {sortedSidequests.length} thing
              {sortedSidequests.length !== 1 ? 's' : ''} happen...
            </Text>

            <View style={profileStyles.cardsWrap}>
              {sortedSidequests.length === 0 ? (
                <Text style={profileStyles.emptyText}>
                  Nothing planned yet. Tap + to add a sidequest!
                </Text>
              ) : (
                sortedSidequests.map((item) => (
                  <SidequestCard
                    key={item.id}
                    sidequest={item}
                    onPress={() => {}}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AddSidequestSheet visible={sheetOpen} onClose={handleSheetClose} />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddPress={() => setSheetOpen(true)}
      />
    </View>
  );
}

// ─── AddSidequestSheet ────────────────────────────────────────────────────────

function AddSidequestSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  React.useEffect(() => {
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
      onPanResponderMove: (_, { dy }) => { if (dy > 0) translateY.setValue(dy); },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 1.5) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
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

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={sheetStyles.backdrop} onPress={onClose} />
      <Animated.View
        style={[sheetStyles.sheetContainer, { transform: [{ translateY }] }]}
      >
        <View {...panResponder.panHandlers} style={sheetStyles.handleArea}>
          <View style={sheetStyles.handle} />
        </View>
        <CreateSidequestForm onClose={onClose} />
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: rs(14),
    paddingVertical: rs(14),
    paddingHorizontal: rs(16),
    marginBottom: rs(10),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: rs(10),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#111',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: rs(10),
  },
  attendeeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeText: {
    fontSize: rs(13),
    fontWeight: '500',
    color: '#444',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: rs(6),
  },
  meta: {
    fontSize: rs(12),
    color: '#555',
  },
  metaDivider: {
    fontSize: rs(12),
    color: '#bbb',
  },
});

const profileStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    paddingHorizontal: rs(18),
    paddingTop: rs(6),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editIconWrap: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ececec',
  },
  logoutText: {
    fontSize: rs(11),
    fontWeight: '700',
    color: '#333',
  },
  hero: { alignItems: 'center', paddingTop: rs(18) },
  name: { fontSize: rs(28), fontWeight: '700', marginTop: rs(10) },
  infoRow: { flexDirection: 'row', gap: rs(18), marginTop: rs(6) },
  infoText: { fontSize: rs(11.5), color: '#666', marginTop: rs(4), textAlign: 'center' },
  shareBtn: { borderWidth: 1, borderColor: '#ddd', marginTop: rs(10), paddingVertical: rs(8), paddingHorizontal: rs(16), borderRadius: rs(6) },
  shareBtnText: { fontSize: rs(10), fontWeight: '700', color: '#333' },
  section: { marginTop: rs(26), paddingHorizontal: rs(16) },
  sectionTitle: { fontSize: rs(26), fontWeight: '800', marginBottom: rs(14) },
  cardsWrap: { gap: rs(0) },
  emptyText: { fontSize: rs(13), color: '#bbb', textAlign: 'center', marginTop: rs(12) },
});

const sheetStyles = StyleSheet.create({
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
  handleArea: { height: 40, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#333' },
});