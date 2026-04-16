import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PfpImg = require('../../../components/myprofile/pfp.png');

const getBaseUrl = () =>
  Platform.OS === 'web'
    ? 'http://'
    : 'http://172.19.3.53:3000';


export default function EditProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [fname, setNamef] = useState('');
  const [lname, setNamel] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [birthday, setBirthday] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (!id) return;
      setCurrentUserId(id);

      try {
        const res = await fetch(`${getBaseUrl()}/users/${id}`);
        if (res.ok) {
          const data = await res.json();
          const user = data.user;

          setNamef(user.first_name ?? '');
          setNamel(user.last_name ?? '');
          setStatus(user.bio ?? '');
          setLocation(user.location ?? '');
          setBirthday(user.birthdate ?? '');
        }
      } catch (err) {
        console.error('[loadProfile]', err);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    console.log('🔵 handleSave fired');
    console.log('currentUserId:', currentUserId);
    console.log('payload:', { fname, lname, status, location, birthday });

    if (!currentUserId) {
      Alert.alert('Error', 'User not loaded. Try again.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${getBaseUrl()}/users/${currentUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: fname,
          last_name: lname,
          bio: status,
          location,
          birthdate: birthday,
        }),
      });

      const text = await res.text();
      console.log('✏️ PATCH /myprofile:', res.status, text);

      if (!res.ok) {
        Alert.alert('Error', text || 'Update failed');
        return;
      }

      router.back();
    } catch (err) {
      console.error('[handleSave]', err);
      Alert.alert('Error', 'Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/myprofile')}>
          <Text style={styles.headerAction}>Cancel</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <Pressable onPress={handleSave} disabled={saving}>
          <Text style={[styles.headerAction, saving && { opacity: 0.4 }]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        <View style={styles.topSection}>
          <Image
            source={PfpImg}
            style={{ width: 118, height: 118 }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              value={fname}
              onChangeText={setNamef}
              style={styles.input}
              placeholder="First name"
              placeholderTextColor="#9a9a9a"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              value={lname}
              onChangeText={setNamel}
              style={styles.input}
              placeholder="Last name"
              placeholderTextColor="#9a9a9a"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Status</Text>
            <TextInput
              value={status}
              onChangeText={setStatus}
              style={[styles.input, styles.multiline]}
              placeholder="What's on your mind?"
              placeholderTextColor="#9a9a9a"
              multiline
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              placeholder="Where are you based?"
              placeholderTextColor="#9a9a9a"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Birthday</Text>
            <TextInput
              value={birthday}
              onChangeText={setBirthday}
              style={styles.input}
              placeholder="e.g. January 21"
              placeholderTextColor="#9a9a9a"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  headerAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6f63ff',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 26,
  },
  photoButton: {
    marginTop: 12,
    backgroundColor: '#f3efe8',
    borderWidth: 1,
    borderColor: '#e4ddd3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  photoButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4d453f',
  },
  form: {
    paddingHorizontal: 18,
    gap: 16,
  },
  field: {
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e7e2da',
    backgroundColor: '#fbfaf8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111111',
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
