import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Modal,
  PanResponder,
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

import { styles } from '../../../components/homepage/homepagestyles';
import { Navbar, NavTabId } from '../../../components/navbar/navbar';
import CreateSidequestForm from '../modals/sidequest/create';

const AllbuttonImg = require('../../../components/homepage/allbuttons.png');
const ClosefriendsButtonImg = require('../../../components/homepage/closefriendsbutton.png');

// ✅ Responsive scale helpers
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 390; // iPhone 14 base
const rs = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size; // responsive scale
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DISMISS_THRESHOLD = 120;

// ✅ Fixed getBaseUrl
const getBaseUrl = () =>
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://YOUR_LAPTOP_IP:3000'; // ← replace with your IP from `ipconfig`

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

function isoToDateTimeParts(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return { date: `${year}-${month}-${day}`, time: `${hours}:${minutes}` };
  } catch {
    return { date: '', time: '' };
  }
}

function partsToIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

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
      style={({ pressed }) => [cardStyles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={cardStyles.headerRow}>
        <Text style={cardStyles.title}>{sidequest.title}</Text>
        <View style={[cardStyles.badge, isCloseFriends ? cardStyles.badgeCF : cardStyles.badgeAll]}>
          <Text style={cardStyles.badgeText}>
            {isCloseFriends ? '🔒 close friends' : '🌍 everyone'}
          </Text>
        </View>
      </View>

      <Text style={cardStyles.desc}>{sidequest.description || 'No description provided'}</Text>

      <View style={cardStyles.metaRow}>
        <Text style={cardStyles.meta}>📅 {formatDate(start)}</Text>
      </View>
      <View style={cardStyles.metaRow}>
        <Text style={cardStyles.meta}>⏰ {formatTime(start)} – {formatTime(end)}</Text>
      </View>
      <View style={cardStyles.metaRow}>
        <Text style={cardStyles.meta}>📍 {sidequest.location || 'No location set'}</Text>
      </View>
      <View style={cardStyles.metaRow}>
        <Text style={cardStyles.meta}>👥 {sidequest.attendees.length}/{sidequest.maxAttendees}</Text>
      </View>

      {sidequest.attendees.length > 0 && (
        <View style={{ marginTop: rs(8) }}>
          <Text style={cardStyles.meta}>going:</Text>
          {sidequest.attendees.map((a) => (
            <Text key={a.id} style={[cardStyles.meta, { marginLeft: rs(8) }]}>• {a.name}</Text>
          ))}
        </View>
      )}

      <Text style={cardStyles.poster}>posted by {sidequest.postedBy.name}</Text>
    </Pressable>
  );
}

// ─── EditSidequestForm ────────────────────────────────────────────────────────

function EditSidequestForm({
  sidequest,
  currentUserId,
  onClose,
  onUpdated,
}: {
  sidequest: Sidequest;
  currentUserId: string | null;
  onClose: () => void;
  onUpdated: (updated: Sidequest) => void;
}) {
  const insets = useSafeAreaInsets();

  const startParts = isoToDateTimeParts(sidequest.startTime);
  const endParts = isoToDateTimeParts(sidequest.endTime);

  const [title, setTitle] = useState(sidequest.title ?? '');
  const [fromDate, setFromDate] = useState(startParts.date);
  const [fromTime, setFromTime] = useState(startParts.time);
  const [toDate, setToDate] = useState(endParts.date);
  const [toTime, setToTime] = useState(endParts.time);
  const [location, setLocation] = useState(sidequest.location ?? '');
  const [detail, setDetail] = useState(sidequest.description ?? '');
  const [maxAtt, setMaxAtt] = useState(String(sidequest.maxAttendees ?? 1));
  const [vis, setVis] = useState<'everyone' | 'close-friends'>(sidequest.circleStatus ?? 'everyone');
  const [openVis, setOpenVis] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentUserId) { Alert.alert('Error', 'User not loaded. Try again.'); return; }
    if (!title.trim()) { Alert.alert('Validation', 'Title cannot be empty.'); return; }

    const maxNum = Math.max(1, parseInt(maxAtt, 10) || 1);
    let startIso: string, endIso: string;
    try {
      startIso = partsToIso(fromDate, fromTime);
      endIso = partsToIso(toDate, toTime);
    } catch {
      Alert.alert('Validation', 'Invalid date or time format.');
      return;
    }
    if (new Date(endIso) <= new Date(startIso)) {
      Alert.alert('Validation', 'End time must be after start time.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `${getBaseUrl()}/events/${sidequest.id}?user_id=${encodeURIComponent(currentUserId)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_title: title.trim(),
            event_des: detail.trim(),
            location: location.trim(),
            time_of_event: startIso,
            time_event_end: endIso,
            max_attendees: maxNum,
            circle_status: vis,
          }),
        }
      );

      const text = await res.text();
      if (!res.ok) { Alert.alert('Error', text || 'Update failed'); return; }

      onUpdated({
        ...sidequest,
        title: title.trim(),
        description: detail.trim(),
        location: location.trim(),
        startTime: startIso,
        endTime: endIso,
        maxAttendees: maxNum,
        circleStatus: vis,
      });
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Network error while updating');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[formStyles.flex, { backgroundColor: '#111' }]}
      contentContainerStyle={{
        paddingBottom: insets.bottom + rs(120),
        paddingHorizontal: rs(16),
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={formStyles.handle} />
      <Text style={formStyles.dragLabel}>EDIT SIDEQUEST</Text>

      <TextInput
        style={formStyles.bigInput}
        placeholder="share what you're up to..."
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={formStyles.lab}>FROM</Text>
      <View style={formStyles.row}>
        <TextInput style={formStyles.pill} placeholder="date" placeholderTextColor="#666" value={fromDate} onChangeText={setFromDate} />
        <TextInput style={formStyles.pill} placeholder="time" placeholderTextColor="#666" value={fromTime} onChangeText={setFromTime} />
      </View>

      <Text style={formStyles.lab}>TO</Text>
      <View style={formStyles.row}>
        <TextInput style={formStyles.pill} placeholder="date" placeholderTextColor="#666" value={toDate} onChangeText={setToDate} />
        <TextInput style={formStyles.pill} placeholder="time" placeholderTextColor="#666" value={toTime} onChangeText={setToTime} />
      </View>

      <TextInput style={formStyles.input} placeholder="📍 location" placeholderTextColor="#666" value={location} onChangeText={setLocation} />
      <TextInput style={[formStyles.input, formStyles.multiline]} placeholder="TELL YOUR FRIENDS WHAT TO EXPECT..." placeholderTextColor="#666" value={detail} onChangeText={setDetail} multiline />

      <Text style={formStyles.lab}>MAX ATTENDEES</Text>
      <TextInput style={formStyles.input} keyboardType="number-pad" placeholderTextColor="#666" value={maxAtt} onChangeText={setMaxAtt} />

      <Text style={formStyles.lab}>VISIBILITY</Text>
      <Pressable style={formStyles.input} onPress={() => setOpenVis((v) => !v)}>
        <Text style={{ color: '#fff', fontSize: rs(14) }}>
          {vis === 'everyone' ? 'Everyone' : 'Close Friends'}
        </Text>
      </Pressable>

      {openVis && (
        <View style={formStyles.dropdown}>
          <Pressable onPress={() => { setVis('close-friends'); setOpenVis(false); }} style={formStyles.opt}>
            <Text style={formStyles.optText}>Close Friends</Text>
          </Pressable>
          <Pressable onPress={() => { setVis('everyone'); setOpenVis(false); }} style={formStyles.opt}>
            <Text style={formStyles.optText}>Everyone</Text>
          </Pressable>
        </View>
      )}

      <View style={{ marginTop: rs(24), gap: rs(10) }}>
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={({ pressed }) => [formStyles.btn, (pressed || saving) && { opacity: 0.75 }]}
        >
          <Text style={formStyles.btnText}>{saving ? 'saving...' : 'save changes →'}</Text>
        </Pressable>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [formStyles.btnCancel, pressed && { opacity: 0.75 }]}
        >
          <Text style={formStyles.btnCancelText}>cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ─── SidequestDetailModal ─────────────────────────────────────────────────────

function SidequestDetailModal({
  sidequest,
  currentUserId,
  onClose,
  onDeleted,
  onUpdated,
}: {
  sidequest: Sidequest | null;
  currentUserId: string | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
  onUpdated: (updated: Sidequest) => void;
}) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const isOwner = useMemo(() => {
    if (!sidequest || !currentUserId) return false;
    return String(sidequest.postedBy?.id) === String(currentUserId);
  }, [sidequest, currentUserId]);

  useEffect(() => { setEditing(false); }, [sidequest?.id]);

  useEffect(() => {
    if (sidequest) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [sidequest]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => { if (dy > 0) translateY.setValue(dy); },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 1.5) {
          Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start(onClose);
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
    })
  ).current;

  const handleDelete = async () => {
    if (!sidequest || !currentUserId) { Alert.alert('Error', 'User not loaded yet. Try again.'); return; }
    setDeleting(true);
    try {
      const res = await fetch(
        `${getBaseUrl()}/events/${sidequest.id}?user_id=${encodeURIComponent(currentUserId)}`,
        { method: 'DELETE' }
      );
      const text = await res.text();
      if (!res.ok) { Alert.alert('Error', text || 'Delete failed'); return; }
      onDeleted(sidequest.id);
      onClose();
    } catch {
      Alert.alert('Error', 'Network error while deleting');
    } finally {
      setDeleting(false);
    }
  };

  if (!sidequest) return null;
  const isCloseFriends = sidequest.circleStatus === 'close-friends';

  return (
    <Modal transparent visible={!!sidequest} animationType="none">
      <View style={{ flex: 1 }}>
        <Pressable style={localStyles.backdrop} onPress={onClose} />
        <Animated.View style={[localStyles.sheetContainer, { transform: [{ translateY }] }]}>
          <View style={localStyles.handleArea} {...panResponder.panHandlers}>
            <View style={localStyles.handle} />
          </View>

          {editing && sidequest ? (
            <EditSidequestForm
              sidequest={sidequest}
              currentUserId={currentUserId}
              onClose={() => setEditing(false)}
              onUpdated={(updated) => { onUpdated(updated); setEditing(false); }}
            />
          ) : (
            <ScrollView
              contentContainerStyle={{
                paddingBottom: rs(140),
                flexGrow: 1,
                paddingHorizontal: rs(16),
                paddingTop: rs(12),
              }}
            >
              <Text style={{ color: '#fff', fontSize: rs(24), fontWeight: '700' }}>{sidequest.title}</Text>
              <Text style={{ color: '#777', marginTop: rs(4), fontSize: rs(13) }}>posted by {sidequest.postedBy.name}</Text>

              <View style={{ marginTop: rs(10) }}>
                <Text style={{ color: '#aaa', fontSize: rs(13) }}>{isCloseFriends ? '🔒 close friends' : '🌍 everyone'}</Text>
              </View>

              <Text style={{ color: '#ccc', marginTop: rs(16), lineHeight: rs(22), fontSize: rs(14) }}>
                {sidequest.description || 'No description provided'}
              </Text>

              <View style={{ marginTop: rs(20) }}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: rs(14) }}>When</Text>
                <Text style={{ color: '#aaa', marginTop: rs(4), fontSize: rs(13) }}>{formatDate(new Date(sidequest.startTime))}</Text>
                <Text style={{ color: '#aaa', fontSize: rs(13) }}>
                  {formatTime(new Date(sidequest.startTime))} → {formatTime(new Date(sidequest.endTime))}
                </Text>
              </View>

              <View style={{ marginTop: rs(20) }}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: rs(14) }}>Location</Text>
                <Text style={{ color: '#aaa', marginTop: rs(4), fontSize: rs(13) }}>📍 {sidequest.location || 'No location set'}</Text>
              </View>

              <View style={{ marginTop: rs(20) }}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: rs(14) }}>
                  Attendees ({sidequest.attendees.length}/{sidequest.maxAttendees})
                </Text>
                {sidequest.attendees.length === 0 ? (
                  <Text style={{ color: '#777', marginTop: rs(6), fontSize: rs(13) }}>No one has joined yet</Text>
                ) : (
                  sidequest.attendees.map((a) => (
                    <Text key={a.id} style={{ color: '#aaa', marginTop: rs(4), fontSize: rs(13) }}>• {a.name}</Text>
                  ))
                )}
              </View>

              {isOwner && (
                <View style={{ marginTop: rs(30) }}>
                  <Pressable
                    onPress={() => setEditing(true)}
                    style={{ padding: rs(14), backgroundColor: '#1a2d3d', borderRadius: rs(12), marginBottom: rs(10) }}
                  >
                    <Text style={{ color: '#4da6ff', textAlign: 'center', fontSize: rs(14) }}>✏️ Edit Sidequest</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDelete}
                    disabled={deleting}
                    style={{ padding: rs(14), backgroundColor: '#2d1010', borderRadius: rs(12), opacity: deleting ? 0.5 : 1 }}
                  >
                    <Text style={{ color: '#ff4d4d', textAlign: 'center', fontSize: rs(14) }}>
                      {deleting ? 'Deleting...' : '🗑 Delete Sidequest'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          )}
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
        setSidequests(data);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchSidequests(); }, [fetchSidequests]));

  useEffect(() => {
    Animated.timing(whiteOverlay, {
      toValue: 0,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredData = useMemo(() => {
    if (filter === 'close-friends') return sidequests.filter((s) => s.circleStatus === 'close-friends');
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

  function handleSidequestUpdated(updated: Sidequest) {
    setSidequests((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedSidequest(updated);
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.slide}>
          <View style={[styles.formBlock, { marginBottom: rs(16) }]}>
            <Text style={[styles.formHeadline, { fontSize: rs(22) }]}>
              what's everyone{'\n'}up to this week?
            </Text>
            <View style={localButtonStyles.row}>
  <View style={localButtonStyles.slot}>
    <Pressable
      onPress={() => setFilter('all')}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : filter === 'all' ? 1 : 0.5,
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <Image
        source={AllbuttonImg}
        style={localButtonStyles.allImg}
        resizeMode="contain"
      />
    </Pressable>
  </View>

  <View style={localButtonStyles.slot}>
    <Pressable
      onPress={() => setFilter('close-friends')}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : filter === 'close-friends' ? 1 : 0.5,
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <Image
        source={ClosefriendsButtonImg}
        style={localButtonStyles.closeImg}
        resizeMode="contain"
      />
    </Pressable>
  </View>
</View>
          </View>

          <FlatList
            data={filteredData}
            extraData={filteredData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingBottom: rs(140),
              flexGrow: 1,
              paddingHorizontal: rs(16),
            }}
            ListEmptyComponent={
              <Text style={localStyles.emptyText}>no sidequests yet, why not create one?</Text>
            }
            renderItem={({ item }) => (
              <SidequestCard sidequest={item} onPress={() => setSelectedSidequest(item)} />
            )}
          />
        </View>
      </SafeAreaView>

      <SidequestDetailModal
        sidequest={selectedSidequest}
        currentUserId={currentUserId}
        onClose={() => setSelectedSidequest(null)}
        onDeleted={handleSidequestDeleted}
        onUpdated={handleSidequestUpdated}
      />

      <AddSidequestSheet
        visible={sheetOpen}
        onClose={handleSidequestCreated}
        onCancel={() => setSheetOpen(false)}
      />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onAddPress={() => setSheetOpen(true)} />

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
      onPanResponderMove: (_, { dy }) => { if (dy > 0) translateY.setValue(dy); },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 1.5) {
          Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true }).start(onCancel);
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
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
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: rs(40),
    color: '#666',
    fontSize: rs(14),
  },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#111',
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
    overflow: 'hidden',
  },
  handleArea: {
    width: '100%',
    height: rs(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: rs(40),
    height: rs(4),
    borderRadius: rs(2),
    backgroundColor: '#333',
  },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: rs(16),
    padding: rs(16),
    marginBottom: rs(12),
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(6),
  },
  title: { color: '#fff', fontSize: rs(15), fontWeight: '700', flex: 1, marginRight: rs(8) },
  badge: { borderRadius: 999, paddingHorizontal: rs(8), paddingVertical: rs(3) },
  badgeCF: { backgroundColor: '#2d1f3d' },
  badgeAll: { backgroundColor: '#1a2d1f' },
  badgeText: { color: '#c8b1db', fontSize: rs(11), fontWeight: '600' },
  desc: { color: '#999', fontSize: rs(13), marginBottom: rs(10), lineHeight: rs(18) },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: rs(4), gap: rs(4) },
  meta: { color: '#777', fontSize: rs(12) },
  poster: { color: '#555', fontSize: rs(11), marginTop: rs(8), fontStyle: 'italic' },
});

const formStyles = StyleSheet.create({
  flex: { flex: 1 },
  dragLabel: {
    textAlign: 'center',
    color: '#888',
    fontSize: rs(11),
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: rs(16),
  },
  handle: {
    alignSelf: 'center',
    width: rs(36),
    height: rs(5),
    borderRadius: rs(3),
    backgroundColor: '#666',
    marginVertical: rs(12),
  },
  bigInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: rs(12),
    padding: rs(14),
    color: '#fff',
    fontSize: rs(15),
    marginBottom: rs(16),
  },
  lab: {
    color: '#888',
    fontSize: rs(11),
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: rs(6),
  },
  row: { flexDirection: 'row', gap: rs(8), marginBottom: rs(12) },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 999,
    padding: rs(10),
    color: '#fff',
    fontSize: rs(13),
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: rs(12),
    padding: rs(12),
    color: '#fff',
    fontSize: rs(13),
    marginBottom: rs(10),
  },
  multiline: { minHeight: rs(100), textAlignVertical: 'top' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: rs(12),
    paddingHorizontal: rs(12),
    marginBottom: rs(10),
  },
  opt: { paddingVertical: rs(10) },
  optText: { color: '#fff', fontSize: rs(14) },
  btn: {
    backgroundColor: '#c8b1db',
    paddingVertical: rs(14),
    borderRadius: rs(12),
    alignItems: 'center',
    borderWidth: 2,
  },
  btnText: { color: '#fff', fontSize: rs(15), fontWeight: '700' },
  btnCancel: {
    paddingVertical: rs(14),
    borderRadius: rs(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  btnCancelText: { color: '#777', fontSize: rs(15) },
});

const localButtonStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: rs(12),
    gap: rs(12),
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  allImg: {
    width: rs(150),
    height: rs(66),
  },
  closeImg: {
    width: rs(150),
    height: rs(66),
    marginLeft: rs(20),  // ✅ nudges it to the right
  },
});