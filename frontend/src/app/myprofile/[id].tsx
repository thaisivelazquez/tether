import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

export default function SharedProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>(); // from URL segment /profile/[id]
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [sidequests, setSidequests] = useState<Sidequest[]>([]);
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

fetch(`${getBaseUrl()}/events/my-sidequests?user_id=${id}`)
  .then((r) => r.json())
  .then((data) => { if (Array.isArray(data)) setSidequests(data); })
  }, [id]);

  const formatBirthday = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

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
        <View style={s.avatarWrap}>
          <View style={s.avatar}>
            <Text style={s.avatarEmoji}>🙂</Text>
          </View>
        </View>

        <Text style={s.name}>{user.first_name} {user.last_name}</Text>
        {!!user.bio && <Text style={s.bio}>{user.bio}</Text>}

        <View style={s.metaRow}>
          {!!user.location && <Text style={s.meta}>📍 {user.location}</Text>}
          {!!user.birthdate && <Text style={s.meta}>🎂 {formatBirthday(user.birthdate)}</Text>}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>
            {user.first_name} is making {sidequests.length} thing{sidequests.length !== 1 ? 's' : ''} happen...
          </Text>
          {sidequests.length === 0 ? (
            <Text style={s.empty}>Nothing planned yet.</Text>
          ) : (
            sidequests.map((sq) => (
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
            ))
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
  avatar: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#e8e8e8', alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 52 },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  bio: { fontSize: 14, color: '#555', marginBottom: 10, textAlign: 'center' },
  metaRow: {
    flexDirection: 'row', gap: 16, marginBottom: 24,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  meta: { fontSize: 13, color: '#555' },
  section: { width: '100%', marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  card: {
    backgroundColor: '#f9f9f9', borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#eee',
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