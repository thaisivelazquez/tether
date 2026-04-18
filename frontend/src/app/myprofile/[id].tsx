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

const getBaseUrl = () =>
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://172.19.0.229:3000';

type User = {
  first_name: string;
  last_name: string;
  bio: string;
  location: string;
  birthdate: string;
};

export default function PublicProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    console.log('📱 Viewing profile for user:', id);

    fetch(`${getBaseUrl()}/users/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

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

  const formatBirthday = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Back button */}
      <Pressable onPress={() => router.back()} style={s.backRow}>
        <Text style={s.backArrow}>← Back</Text>
      </Pressable>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Avatar placeholder */}
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {user.first_name?.[0]}{user.last_name?.[0]}
          </Text>
        </View>

        {/* Name */}
        <Text style={s.name}>
          {user.first_name} {user.last_name}
        </Text>

        {/* Bio */}
        {!!user.bio && (
          <Text style={s.bio}>{user.bio}</Text>
        )}

        {/* Location */}
        {!!user.location && (
          <Text style={s.meta}>📍 {user.location}</Text>
        )}

        {/* Birthday */}
        {!!user.birthdate && (
          <Text style={s.meta}>🎂 {formatBirthday(user.birthdate)}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
  },
  backRow: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backArrow: {
    fontSize: 16,
    color: '#c8b1db',
    fontWeight: '600',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0eaf7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#c8b1db',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  meta: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0eaf7',
    borderRadius: 999,
  },
  backBtnText: {
    color: '#c8b1db',
    fontWeight: '600',
    fontSize: 14,
  },
});