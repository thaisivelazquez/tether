import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 390;
const rs = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

const getBaseUrl = () => {
  if (!__DEV__) return 'https://tether-production-c60a.up.railway.app';
  return Platform.OS === 'web' ? 'http://localhost:3000' : 'http://172.19.10.138:3000';
};

const PfpImg = require('../../../components/myprofile/pfp.png');

type User = {
  first_name: string;
  last_name: string;
  bio: string;
  location: string;
  birthdate: string;
};

type Sidequest = {
  id: string;
  title: string;
  location: string;
  maxAttendees: number;
  attendees: any[];
  startTime: string;
  endTime: string;
};

type Mutual = {
  id: string;
  first_name: string;
  last_name: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function formatEventTimeRange(startIso: string, endIso: string): string {
  if (!startIso || !endIso) return '';
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
  attending = false,
}: {
  sidequest: Sidequest;
  attending?: boolean;
}) {
  return (
    <View style={[cardStyles.card, attending && cardStyles.cardAttending]}>
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
        {!!(sidequest.startTime && sidequest.endTime) && (
          <>
            <Text style={cardStyles.metaDivider}>·</Text>
            <Text style={cardStyles.meta} numberOfLines={1}>
              🕐 {formatEventTimeRange(sidequest.startTime, sidequest.endTime)}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

// ─── FriendProfilePage ────────────────────────────────────────────────────────

export default function FriendProfilePage() {
  const params = useLocalSearchParams<{ id?: string; userId?: string }>();
  const id = params.userId ?? params.id;
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [sidequests, setSidequests] = useState<Sidequest[]>([]);
  const [attendingSidequests, setAttendingSidequests] = useState<Sidequest[]>([]);
  const [mutuals, setMutuals] = useState<Mutual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`${getBaseUrl()}/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    fetch(`${getBaseUrl()}/sidequests?user_id=${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.sidequests) setSidequests(data.sidequests); })
      .catch(() => {});

    fetch(`${getBaseUrl()}/sidequests/attending?user_id=${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.sidequests) setAttendingSidequests(data.sidequests); })
      .catch(() => {});

    AsyncStorage.getItem('user_id').then((currentUserId) => {
      if (!currentUserId) return;
      fetch(`${getBaseUrl()}/users/mutuals?current_user_id=${currentUserId}&friend_user_id=${id}`)
        .then((r) => r.json())
        .then((data) => { if (data.mutuals) setMutuals(data.mutuals); })
        .catch(() => {});
    });
  }, [id]);

  const formatBirthday = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const totalCount = sidequests.length + attendingSidequests.length;

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#c8b1db" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>Profile not found</Text>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <Pressable onPress={() => router.back()} style={s.backRow}>
        <Text style={s.backArrow}>← Back</Text>
      </Pressable>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <Image source={PfpImg} style={{ width: rs(136), height: rs(136) }} resizeMode="contain" />
        </View>

        {/* Name */}
        <Text style={s.name}>{user.first_name} {user.last_name}</Text>

        {/* Bio */}
        {!!user.bio && <Text style={s.bio}>{user.bio}</Text>}

        {/* Location + Birthday */}
        <View style={s.metaRow}>
          {!!user.location && <Text style={s.meta}>📍 {user.location}</Text>}
          {!!user.birthdate && <Text style={s.meta}>🎂 {formatBirthday(user.birthdate)}</Text>}
        </View>

        {/* Mutuals */}
        {mutuals.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Mutuals</Text>
            <Text style={s.sectionSub}>
              Friends of yours who are in {user.first_name}'s orbit 🙌
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mutuals.map((m) => (
                <View key={m.id} style={s.mutualItem}>
                  <Image source={PfpImg} style={s.mutualAvatar} resizeMode="contain" />
                  <Text style={s.mutualName}>{m.first_name} {m.last_name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Sidequests */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            {user.first_name} is making {totalCount} thing{totalCount !== 1 ? 's' : ''} happen...
          </Text>

          {totalCount === 0 ? (
            <Text style={s.empty}>Nothing planned yet.</Text>
          ) : (
            <>
              {sidequests.length > 0 && (
                <>
                  {attendingSidequests.length > 0 && (
                    <Text style={s.subLabel}>HOSTING</Text>
                  )}
                  {sidequests.map((sq) => (
                    <SidequestCard key={sq.id} sidequest={sq} attending={false} />
                  ))}
                </>
              )}

              {attendingSidequests.length > 0 && (
                <>
                  <Text style={s.subLabel}>GOING</Text>
                  {attendingSidequests.map((sq) => (
                    <SidequestCard key={sq.id} sidequest={sq} attending={true} />
                  ))}
                </>
              )}
            </>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
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
  cardAttending: {
    backgroundColor: '#f9f6ff',
    borderColor: 'rgba(200,177,219,0.35)',
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backRow: { paddingHorizontal: rs(20), paddingVertical: rs(12) },
  backArrow: { fontSize: rs(15), color: '#555', fontWeight: '500' },
  scroll: { alignItems: 'center', paddingHorizontal: rs(24), paddingBottom: rs(60) },

  avatarWrap: { marginTop: rs(12), marginBottom: rs(16) },

  name: { fontSize: rs(22), fontWeight: '700', color: '#1a1a1a', marginBottom: rs(6) },
  bio: { fontSize: rs(14), color: '#555', marginBottom: rs(10), textAlign: 'center' },
  metaRow: {
    flexDirection: 'row',
    gap: rs(16),
    marginBottom: rs(24),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  meta: { fontSize: rs(13), color: '#555' },

  section: { width: '100%', marginBottom: rs(28) },
  sectionTitle: { fontSize: rs(25), fontWeight: '700', color: '#1a1a1a', marginBottom: rs(4) },
  sectionSub: { fontSize: rs(12), color: '#888', marginBottom: rs(12) },

  subLabel: {
    fontSize: rs(10),
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#aaa',
    marginTop: rs(12),
    marginBottom: rs(6),
  },

  mutualItem: { alignItems: 'center', marginRight: rs(16), width: rs(70) },
  mutualAvatar: { width: rs(52), height: rs(52), marginBottom: rs(4) },
  mutualName: { fontSize: rs(11), color: '#333', textAlign: 'center' },

  empty: { fontSize: rs(13), color: '#bbb', textAlign: 'center', marginTop: rs(12) },

  errorText: { fontSize: rs(15), color: '#888', marginBottom: rs(16) },
  backBtn: {
    backgroundColor: '#f0ebff',
    paddingHorizontal: rs(20),
    paddingVertical: rs(10),
    borderRadius: rs(20),
  },
  backBtnText: { fontSize: rs(14), fontWeight: '600', color: '#7b4fa6' },
});