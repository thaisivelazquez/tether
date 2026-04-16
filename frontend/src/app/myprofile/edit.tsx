import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Pfp from '../../../components/myprofile/pfp.svg';

export default function EditProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('Jane Doe');
  const [status, setStatus] = useState("craving JJ's french toast...");
  const [location, setLocation] = useState('Manhattan, NY');
  const [birthday, setBirthday] = useState('January 21');

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.headerAction}>Cancel</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Edit Profile</Text>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.headerAction}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        <View style={styles.topSection}>
          <Pfp width={118} height={118} />
          {/* <Pressable style={styles.photoButton}>
            <Text style={styles.photoButtonText}>Change Photo</Text>
          </Pressable> */}
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#9a9a9a"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Status</Text>
            <TextInput
              value={status}
              onChangeText={setStatus}
              style={[styles.input, styles.multiline]}
              placeholder="Status"
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
              placeholder="Location"
              placeholderTextColor="#9a9a9a"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Birthday</Text>
            <TextInput
              value={birthday}
              onChangeText={setBirthday}
              style={styles.input}
              placeholder="Birthday"
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