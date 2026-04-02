import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  KeyboardAvoidingView,
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

import Allbutton from '../../../components/homepage/allbuttons.svg';
import Closefriendsbutton from '../../../components/homepage/closefriendsbutton.svg';
import { styles } from '../../../components/homepage/homepagestyles';
import { Navbar, NavTabId } from '../../../components/navbar/navbar';
import { SidequestCard } from '../../../components/sidequest/sidequestcard';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DISMISS_THRESHOLD = 120;

/** -------------------------------
 * Types
 * ------------------------------- */
type RingLevel = 'friends' | 'close-friends';
type User = {
  id: string;
  name: string;
  ringLevel: RingLevel;
  avatar: string;
  handle: string;
  location: string;
  status: string;
};

type Sidequest = {
  id: string;
  title: string;
  description: string;
  visibility: 'close-friends' | 'everyone';
  postedBy: User;
  attendees: User[];
  createdAt: string;
  startTime: string;
  endTime: string;
  location: string;
  maxAttendees: number;
};

/** -------------------------------
 * Mock data
 * ------------------------------- */
const mockUsers: User[] = [
  { id: 'u1', name: 'Alice', ringLevel: 'close-friends', avatar: '👩', handle: '@alice', location: 'NYC', status: 'Hey there!' },
  { id: 'u2', name: 'Bob', ringLevel: 'friends', avatar: '🧑', handle: '@bob', location: 'SF', status: 'Ready to party!' },
];

const now = new Date();
const mockSidequests: Sidequest[] = [
  {
    id: 'sq1',
    title: 'Go Hiking',
    description: 'A fun hike in the mountains.',
    visibility: 'close-friends',
    postedBy: mockUsers[0],
    attendees: [],
    createdAt: now.toISOString(),
    startTime: new Date(now.getTime() + 3600_000).toISOString(),
    endTime: new Date(now.getTime() + 3 * 3600_000).toISOString(),
    location: 'Bear Mountain',
    maxAttendees: 5,
  },
  {
    id: 'sq2',
    title: 'Board Game Night',
    description: 'Fun board games at my place.',
    visibility: 'everyone',
    postedBy: mockUsers[1],
    attendees: [],
    createdAt: now.toISOString(),
    startTime: new Date(now.getTime() + 7200_000).toISOString(),
    endTime: new Date(now.getTime() + 4 * 3600_000).toISOString(),
    location: "Bob's apartment",
    maxAttendees: 8,
  },
];

/** -------------------------------
 * AppContext
 * ------------------------------- */
type AppContextValue = {
  sidequests: Sidequest[];
  addSidequest: (s: Sidequest) => void;
};
const AppContext = createContext<AppContextValue | null>(null);

const AppProvider = ({
  children,
  sidequests,
  addSidequest,
}: {
  children: ReactNode;
  sidequests: Sidequest[];
  addSidequest: (s: Sidequest) => void;
}) => {
  return (
    <AppContext.Provider value={{ sidequests, addSidequest }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

/** -------------------------------
 * Add Sidequest Sheet
 * ------------------------------- */
function AddSidequestSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { addSidequest } = useApp();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const [title, setTitle] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toDate, setToDate] = useState('');
  const [toTime, setToTime] = useState('');
  const [location, setLocation] = useState('');
  const [detail, setDetail] = useState('');
  const [maxAtt, setMaxAtt] = useState('1');
  const [vis, setVis] = useState<'everyone' | 'close-friends'>('close-friends');
  const [openVis, setOpenVis] = useState(false);

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

  function handleSubmit() {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(15, 0, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const newSidequest: Sidequest = {
      id: `sq-${Date.now()}`,
      title: title.trim() || 'share what you are up to',
      description: detail.trim() || 'Tell your friends what to expect.',
      visibility: vis,
      postedBy: mockUsers[0],
      attendees: [],
      createdAt: new Date().toISOString(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      location: location.trim() || 'Columbia University area',
      maxAttendees: Math.max(1, parseInt(maxAtt, 10) || 1),
    };

    addSidequest(newSidequest);

    setTitle(''); setFromDate(''); setFromTime('');
    setToDate(''); setToTime(''); setLocation('');
    setDetail(''); setMaxAtt('1'); setVis('close-friends');
    setOpenVis(false);
    onClose();
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={sheet.backdrop} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={sheet.kavWrapper}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            sheet.sheetContainer,
            { paddingBottom: insets.bottom + 16 },
            { transform: [{ translateY }] },
          ]}
        >
          <View {...panResponder.panHandlers} style={sheet.handleArea}>
            <View style={sheet.handle} />
          </View>

          <Text style={sheet.dragLabel}>CREATE SIDEQUEST</Text>

          <ScrollView
            style={sheet.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          >
            <TextInput
              style={sheet.bigInput}
              placeholder="share what you're up to..."
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={sheet.lab}>FROM</Text>
            <View style={sheet.row}>
              <TextInput style={sheet.pill} placeholder="date" placeholderTextColor="#666" value={fromDate} onChangeText={setFromDate} />
              <TextInput style={sheet.pill} placeholder="time" placeholderTextColor="#666" value={fromTime} onChangeText={setFromTime} />
            </View>

            <Text style={sheet.lab}>TO</Text>
            <View style={sheet.row}>
              <TextInput style={sheet.pill} placeholder="date" placeholderTextColor="#666" value={toDate} onChangeText={setToDate} />
              <TextInput style={sheet.pill} placeholder="time" placeholderTextColor="#666" value={toTime} onChangeText={setToTime} />
            </View>

            <TextInput
              style={sheet.input}
              placeholder="📍 location"
              placeholderTextColor="#666"
              value={location}
              onChangeText={setLocation}
            />

            <TextInput
              style={[sheet.input, sheet.multiline]}
              placeholder="TELL YOUR FRIENDS WHAT TO EXPECT..."
              placeholderTextColor="#666"
              value={detail}
              onChangeText={setDetail}
              multiline
            />

            <Text style={sheet.lab}>MAX ATTENDEES</Text>
            <TextInput
              style={sheet.input}
              keyboardType="number-pad"
              placeholderTextColor="#666"
              value={maxAtt}
              onChangeText={setMaxAtt}
            />

            <Text style={sheet.lab}>VISIBILITY</Text>
            <Pressable style={sheet.input} onPress={() => setOpenVis((v) => !v)}>
              <Text style={{ color: '#fff' }}>
                {vis === 'everyone' ? 'Everyone' : 'Close Friends'}
              </Text>
            </Pressable>
            {openVis && (
              <View style={sheet.dropdown}>
                <Pressable onPress={() => { setVis('close-friends'); setOpenVis(false); }} style={sheet.opt}>
                  <Text style={sheet.optText}>Close Friends</Text>
                </Pressable>
                <Pressable onPress={() => { setVis('everyone'); setOpenVis(false); }} style={sheet.opt}>
                  <Text style={sheet.optText}>Everyone</Text>
                </Pressable>
              </View>
            )}

            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [sheet.submitBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={sheet.submitText}>share →</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** -------------------------------
 * Homepage
 * ------------------------------- */
export default function HomePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const whiteOverlay = useRef(new Animated.Value(1)).current;
  const [filter, setFilter] = useState<'all' | 'close-friends'>('all');
  const [activeTab, setActiveTab] = useState<NavTabId>('home');
  const [sheetOpen, setSheetOpen] = useState(false);

  const [sidequests, setSidequests] = useState<Sidequest[]>(mockSidequests);

  const addSidequest = useCallback((newSidequest: Sidequest) => {
    setSidequests((prev) => [newSidequest, ...prev]);
  }, []);

  return (
    <AppProvider sidequests={sidequests} addSidequest={addSidequest}>
      <InnerHomePage
        filter={filter}
        setFilter={setFilter}
        whiteOverlay={whiteOverlay}
        insets={insets}
        router={router}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sheetOpen={sheetOpen}
        setSheetOpen={setSheetOpen}
      />
    </AppProvider>
  );
}

const InnerHomePage = ({
  filter,
  setFilter,
  whiteOverlay,
  insets,
  router,
  activeTab,
  setActiveTab,
  sheetOpen,
  setSheetOpen,
}: any) => {
  const { sidequests } = useApp();

  const data = useMemo(() => {
    let filtered = sidequests;
    if (filter === 'close-friends') {
      filtered = sidequests.filter(
        (s) => s.visibility === 'close-friends' || s.postedBy?.ringLevel === 'close-friends'
      );
    }
    return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter, sidequests]);

  useEffect(() => {
    Animated.timing(whiteOverlay, {
      toValue: 0,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.slide}>
          <View style={styles.formBlock}>
            <Text style={styles.formHeadline}>
              what's everyone{'\n'}up to this week?
            </Text>
            <View style={styles.buttonRow}>
              <Pressable onPress={() => setFilter('all')} style={{ opacity: filter === 'all' ? 1 : 0.5 }}>
                <Allbutton style={styles.allfriendsBtn} />
              </Pressable>
              <Pressable onPress={() => setFilter('close-friends')} style={{ opacity: filter === 'close-friends' ? 1 : 0.5 }}>
                <Closefriendsbutton style={styles.closefriendsBtn} />
              </Pressable>
            </View>
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 140, flexGrow: 1 }}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>no sidequests yet 👀</Text>}
            renderItem={({ item }) => (
              <SidequestCard
                sidequest={item}
                onPress={() => router.push(`/sidequest/${item.id}`)}
              />
            )}
          />
        </View>
      </SafeAreaView>

      <AddSidequestSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      {/* ✅ Clean single import from navbar/navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddPress={() => setSheetOpen(true)}
      />

      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#FFFFFF',
          opacity: whiteOverlay,
        }}
      />
    </View>
  );
};

/** -------------------------------
 * Sheet Styles
 * ------------------------------- */
const sheet = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: SHEET_HEIGHT,
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
  },
  dragLabel: {
    textAlign: 'center',
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 16,
  },
  scroll: { flex: 1 },
  bigInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  lab: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 999,
    padding: 10,
    color: '#fff',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  opt: { paddingVertical: 10 },
  optText: { color: '#fff', fontSize: 14 },
  submitBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});