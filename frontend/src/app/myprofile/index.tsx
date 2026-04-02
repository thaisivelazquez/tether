import { useRouter } from 'expo-router';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Dimensions,
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

import AddFriendButton from '../../../components/myprofile/addfriendbutton.svg';
import EditButton from '../../../components/myprofile/editbutton.svg';
import Pfp from '../../../components/myprofile/pfp.svg';
import { Navbar, NavTabId } from '../../../components/navbar/navbar';

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

type Friend = {
  id: string;
  name: string;
};

/** -------------------------------
 * Mock data
 * ------------------------------- */
const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Jane Doe',
    ringLevel: 'close-friends',
    avatar: '🙂',
    handle: '@janedoe',
    location: 'Manhattan, NY',
    status: "craving JJ's french toast...",
  },
  {
    id: 'u2',
    name: 'John Doe',
    ringLevel: 'friends',
    avatar: '🙂',
    handle: '@johndoe',
    location: 'NYC',
    status: 'down to study',
  },
];

const mockFriends: Friend[] = [
  { id: 'f1', name: 'John Doe' },
  { id: 'f2', name: 'John Doe' },
  { id: 'f3', name: 'John Doe' },
  { id: 'f4', name: 'John Doe' },
];

const now = new Date();

const initialSidequests: Sidequest[] = [
  {
    id: 'sq1',
    title: 'studying at butler... tn and tmr',
    description: 'let’s lock in',
    visibility: 'close-friends',
    postedBy: mockUsers[0],
    attendees: [mockUsers[1]],
    createdAt: now.toISOString(),
    startTime: new Date(now.getTime() + 3600_000).toISOString(),
    endTime: new Date(now.getTime() + 12 * 3600_000).toISOString(),
    location: 'Butler Library',
    maxAttendees: 5,
  },
  {
    id: 'sq2',
    title: 'studying at butler... tn and tmr',
    description: 'same thing tomorrow too',
    visibility: 'everyone',
    postedBy: mockUsers[0],
    attendees: [mockUsers[1]],
    createdAt: new Date(now.getTime() - 3000).toISOString(),
    startTime: new Date(now.getTime() + 3600_000).toISOString(),
    endTime: new Date(now.getTime() + 12 * 3600_000).toISOString(),
    location: 'Butler Library',
    maxAttendees: 5,
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
  }, [visible, translateY]);

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

    setTitle('');
    setFromDate('');
    setFromTime('');
    setToDate('');
    setToTime('');
    setLocation('');
    setDetail('');
    setMaxAtt('1');
    setVis('close-friends');
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
              <TextInput
                style={sheet.pill}
                placeholder="date"
                placeholderTextColor="#666"
                value={fromDate}
                onChangeText={setFromDate}
              />
              <TextInput
                style={sheet.pill}
                placeholder="time"
                placeholderTextColor="#666"
                value={fromTime}
                onChangeText={setFromTime}
              />
            </View>

            <Text style={sheet.lab}>TO</Text>
            <View style={sheet.row}>
              <TextInput
                style={sheet.pill}
                placeholder="date"
                placeholderTextColor="#666"
                value={toDate}
                onChangeText={setToDate}
              />
              <TextInput
                style={sheet.pill}
                placeholder="time"
                placeholderTextColor="#666"
                value={toTime}
                onChangeText={setToTime}
              />
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
                <Pressable
                  onPress={() => {
                    setVis('close-friends');
                    setOpenVis(false);
                  }}
                  style={sheet.opt}
                >
                  <Text style={sheet.optText}>Close Friends</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setVis('everyone');
                    setOpenVis(false);
                  }}
                  style={sheet.opt}
                >
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
 * Small UI bits
 * ------------------------------- */
function FriendBubble({ name }: { name: string }) {
  return (
    <View style={styles.friendItem}>
      <View style={styles.friendAvatar} />
      <Text style={styles.friendName} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function ProfileSidequestCard({ sidequest }: { sidequest: Sidequest }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTitle}>{sidequest.title}</Text>
        <Text style={styles.cardCount}>
          👥 {sidequest.attendees.length}/{sidequest.maxAttendees}
        </Text>
      </View>

      <View style={styles.cardMetaRow}>
        <Text style={styles.cardMeta}>📍 {sidequest.location}</Text>
        <Text style={styles.cardMeta}>🕒 Today, 10PM - Tomorrow</Text>
      </View>
    </View>
  );
}

/** -------------------------------
 * Profile Page
 * ------------------------------- */
export default function ProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NavTabId>('profile');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidequests, setSidequests] = useState<Sidequest[]>(initialSidequests);

  const addSidequest = useCallback((newSidequest: Sidequest) => {
    setSidequests((prev) => [newSidequest, ...prev]);
  }, []);

  return (
    <AppProvider sidequests={sidequests} addSidequest={addSidequest}>
      <InnerProfilePage
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

const InnerProfilePage = ({
  insets,
  router,
  activeTab,
  setActiveTab,
  sheetOpen,
  setSheetOpen,
}: any) => {
  const { sidequests } = useApp();

  const data = useMemo(() => {
    return [...sidequests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [sidequests]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <View style={styles.topBar}>
            <View style={{ width: 28 }} />
            <Pressable
              onPress={() => router.push('/profile/edit')}
              style={styles.editIconWrap}
            >
              <EditButton width={22} height={22} />
            </Pressable>
          </View>

          <View style={styles.hero}>
            <View style={styles.avatarWrap}>
              <Pfp width={136} height={136} />
            </View>

            <Text style={styles.name}>Jane Doe</Text>
            <Text style={styles.status}>craving JJ&apos;s french toast...</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>📍 Manhattan, NY</Text>
              <Text style={styles.infoText}>🎂 January 21</Text>
            </View>

            <Pressable style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>SHARE PROFILE</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Friends</Text>
                <Text style={styles.sectionSubtitle}>People in your orbit 🪐</Text>
              </View>

              <Pressable style={styles.addFriendBtn}>
                <AddFriendButton width={22} height={22} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendsRow}
            >
              {mockFriends.map((friend) => (
                <FriendBubble key={friend.id} name={friend.name} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.bigSectionTitle}>
              You are making 3 things happen...
            </Text>

            <View style={styles.cardsWrap}>
              {data.map((item) => (
                <ProfileSidequestCard key={item.id} sidequest={item} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AddSidequestSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddPress={() => setSheetOpen(true)}
      />
    </View>
  );
};

/** -------------------------------
 * Screen styles
 * ------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  topBar: {
    paddingHorizontal: 18,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ececec',
  },

  hero: {
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 24,
  },
  avatarWrap: {
    marginBottom: 18,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  status: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 11.5,
    color: '#666',
  },
  shareBtn: {
    borderWidth: 1,
    borderColor: '#d8d1c7',
    backgroundColor: '#efe7dc',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 4,
  },
  shareBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#5a4c42',
    letterSpacing: 0.8,
  },

  section: {
    marginTop: 26,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#555',
  },
  addFriendBtn: {
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
  friendAvatar: {
    width: 39,
    height: 39,
    borderRadius: 19.5,
    backgroundColor: '#d9d9d9',
    borderWidth: 1,
    borderColor: '#8f8f8f',
    marginBottom: 7,
  },
  friendName: {
    fontSize: 11.5,
    color: '#111',
  },

  bigSectionTitle: {
    fontSize: 31,
    lineHeight: 33,
    fontWeight: '800',
    color: '#111',
    marginBottom: 14,
    maxWidth: 280,
  },
  cardsWrap: {
    gap: 12,
  },
  card: {
    backgroundColor: '#f7f4ef',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ece5db',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
    color: '#111',
  },
  cardCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardMeta: {
    fontSize: 11.5,
    color: '#666',
  },
});

/** -------------------------------
 * Sheet styles
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
  scroll: {
    flex: 1,
  },
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
  opt: {
    paddingVertical: 10,
  },
  optText: {
    color: '#fff',
    fontSize: 14,
  },
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