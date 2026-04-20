import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

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
  createdAt: string;
};

type Mutual = {
  id: string;
  first_name: string;
  last_name: string;
};

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

    // Sidequests this user CREATED
    fetch(`${getBaseUrl()}/sidequests?user_id=${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.sidequests) setSidequests(data.sidequests); })
      .catch(() => {});

    // Sidequests this user is ATTENDING (but didn't create)
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

  // All events this person is involved in
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
          <Image
            source={PfpImg}
            style={{ width: 136, height: 136 }}
            resizeMode="contain"
          />
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
                  <Image
                    source={PfpImg}
                    style={s.mutualAvatar}
                    resizeMode="contain"
                  />
                  <Text style={s.mutualName}>{m.first_name} {m.last_name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Sidequests — Created + Attending */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            {user.first_name} is making {totalCount} thing{totalCount !== 1 ? 's' : ''} happen...
          </Text>

          {totalCount === 0 ? (
            <Text style={s.empty}>Nothing planned yet.</Text>
          ) : (
            <>
              {/* Created by this user */}
              {sidequests.length > 0 && (
                <>
                  {attendingSidequests.length > 0 && (
                    <Text style={s.subLabel}>HOSTING</Text>
                  )}
                  {sidequests.map((sq) => (
                    <View key={sq.id} style={s.card}>
                      <Text style={s.cardTitle}>{sq.title}</Text>
                      <View style={s.cardMeta}>
                        <Text style={s.cardMetaText}>📍 {sq.location}</Text>
                        {sq.maxAttendees && (
                          <Text style={s.cardMetaText}>
                            👥 {sq.attendees?.length ?? 0}/{sq.maxAttendees}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </>
              )}

              {/* Attending but not hosting */}
              {attendingSidequests.length > 0 && (
                <>
                  <Text style={s.subLabel}>GOING</Text>
                  {attendingSidequests.map((sq) => (
                    <View key={sq.id} style={[s.card, s.cardAttending]}>
                      <Text style={s.cardTitle}>{sq.title}</Text>
                      <View style={s.cardMeta}>
                        <Text style={s.cardMetaText}>📍 {sq.location}</Text>
                        {sq.maxAttendees && (
                          <Text style={s.cardMetaText}>
                            👥 {sq.attendees?.length ?? 0}/{sq.maxAttendees}
                          </Text>
                        )}
                      </View>
                    </View>
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backRow: { paddingHorizontal: 20, paddingVertical: 12 },
  backArrow: { fontSize: 15, color: '#555', fontWeight: '500' },
  scroll: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 60 },

  avatarWrap: { marginTop: 12, marginBottom: 16 },

  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  bio: { fontSize: 14, color: '#555', marginBottom: 10, textAlign: 'center' },
  metaRow: {
    flexDirection: 'row', gap: 16, marginBottom: 24,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  meta: { fontSize: 13, color: '#555' },

  section: { width: '100%', marginBottom: 28 },
  sectionTitle: { fontSize: 25, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  sectionSub: { fontSize: 12, color: '#888', marginBottom: 12 },

  subLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#aaa',
    marginTop: 12,
    marginBottom: 6,
  },

  mutualItem: { alignItems: 'center', marginRight: 16, width: 70 },
  mutualAvatar: { width: 52, height: 52, marginBottom: 4 },
  mutualName: { fontSize: 11, color: '#333', textAlign: 'center' },

  card: {
    backgroundColor: '#f9f9f9', borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#eee',
  },
  cardAttending: {
    backgroundColor: '#f0ebff',
    borderColor: '#d4c5f9',
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', gap: 12 },
  cardMetaText: { fontSize: 12, color: '#777' },
  empty: { fontSize: 13, color: '#bbb', textAlign: 'center', marginTop: 12 },

  errorText: { fontSize: 15, color: '#888', marginBottom: 16 },
  backBtn: {
    backgroundColor: '#f0ebff', paddingHorizontal: 20,
    paddingVertical: 10, borderRadius: 20,
  },
  backBtnText: { fontSize: 14, fontWeight: '600', color: '#7b4fa6' },
});