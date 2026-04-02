import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AddFriendButton from '../../../components/myprofile/addfriendbutton.svg';
import EditButton from '../../../components/myprofile/editbutton.svg';
import Pfp from '../../../components/myprofile/pfp.svg';
import { Navbar, NavTabId } from '../../../components/navbar/navbar';

type Friend = {
  id: string;
  name: string;
};

type SidequestCardData = {
  id: string;
  title: string;
  location: string;
  time: string;
  spots: string;
};

const friends: Friend[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'John Doe' },
  { id: '3', name: 'John Doe' },
  { id: '4', name: 'John Doe' },
];

const sidequests: SidequestCardData[] = [
  {
    id: '1',
    title: 'studying at butler... tn and tmr',
    location: 'Butler Library',
    time: 'Today, 10PM - Tomorrow',
    spots: '2/5',
  },
  {
    id: '2',
    title: 'studying at butler... tn and tmr',
    location: 'Butler Library',
    time: 'Today, 10PM - Tomorrow',
    spots: '2/5',
  },
];

function FriendPill({ name }: { name: string }) {
  return (
    <View style={styles.friendItem}>
      <View style={styles.friendCircle} />
      <Text style={styles.friendLabel} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function SidequestPreviewCard({ item }: { item: SidequestCardData }) {
  return (
    <View style={styles.sidequestCard}>
      <View style={styles.sidequestTopRow}>
        <Text style={styles.sidequestTitle}>{item.title}</Text>
        <Text style={styles.sidequestCount}>👥 {item.spots}</Text>
      </View>

      <View style={styles.sidequestMetaRow}>
        <Text style={styles.sidequestMeta}>📍 {item.location}</Text>
        <Text style={styles.sidequestMeta}>🕒 {item.time}</Text>
      </View>
    </View>
  );
}

export default function MyProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NavTabId>('profile');

  return (
    <View style={styles.screen}>
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <Pressable
              onPress={() => router.push('/myprofile/edit')}
              style={styles.editButtonWrap}
            >
              <EditButton width={24} height={24} />
            </Pressable>
          </View>

          <View style={styles.profileBlock}>
            <View style={styles.avatarBlock}>
              <Pfp width={138} height={138} />
            </View>

            <Text style={styles.name}>Jane Doe</Text>
            <Text style={styles.status}>craving JJ&apos;s french toast...</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>📍 Manhattan, NY</Text>
              <Text style={styles.metaText}>🎂 January 21</Text>
            </View>

            <Pressable style={styles.shareButton}>
              <Text style={styles.shareButtonText}>SHARE PROFILE</Text>
            </Pressable>
          </View>

          <View style={styles.sectionWrap}>
            <View style={styles.friendsHeaderRow}>
              <View>
                <Text style={styles.friendsTitle}>Friends</Text>
                <Text style={styles.friendsSubtitle}>People in your orbit 🪐</Text>
              </View>

              <Pressable style={styles.addFriendWrap}>
                <AddFriendButton width={22} height={22} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendsRow}
            >
              {friends.map((friend) => (
                <FriendPill key={friend.id} name={friend.name} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.sectionWrap}>
            <Text style={styles.bigTitle}>You are making 3 things happen...</Text>

            <View style={styles.sidequestList}>
              {sidequests.map((item) => (
                <SidequestPreviewCard key={item.id} item={item} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  headerRow: {
    paddingHorizontal: 18,
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 30,
  },
  editButtonWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#efefef',
  },

  profileBlock: {
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 24,
  },
  avatarBlock: {
    marginBottom: 18,
  },
  name: {
    fontSize: 29,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 4,
  },
  status: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 11.5,
    color: '#666666',
  },
  shareButton: {
    backgroundColor: '#efe7dc',
    borderWidth: 1,
    borderColor: '#ddd2c6',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 3,
  },
  shareButtonText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#5f5449',
    letterSpacing: 0.8,
  },

  sectionWrap: {
    marginTop: 26,
    paddingHorizontal: 16,
  },

  friendsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 2,
  },
  friendsSubtitle: {
    fontSize: 11.5,
    color: '#666666',
  },
  addFriendWrap: {
    marginTop: 1,
    padding: 2,
  },

  friendsRow: {
    paddingRight: 10,
    gap: 18,
  },
  friendItem: {
    width: 74,
    alignItems: 'center',
  },
  friendCircle: {
    width: 39,
    height: 39,
    borderRadius: 19.5,
    backgroundColor: '#d8d8d8',
    borderWidth: 1,
    borderColor: '#8d8d8d',
    marginBottom: 7,
  },
  friendLabel: {
    fontSize: 11.5,
    color: '#111111',
  },

  bigTitle: {
    fontSize: 31,
    lineHeight: 33,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 14,
    maxWidth: 280,
  },

  sidequestList: {
    gap: 12,
  },
  sidequestCard: {
    backgroundColor: '#f8f4ee',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#eee6dc',
  },
  sidequestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  sidequestTitle: {
    flex: 1,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111111',
  },
  sidequestCount: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  sidequestMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sidequestMeta: {
    fontSize: 11.5,
    color: '#666666',
  },
});