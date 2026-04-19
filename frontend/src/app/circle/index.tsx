import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
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
import { Navbar, NavTabId } from '../../../components/navbar/navbar';
import CreateSidequestForm from '../modals/sidequest/create';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DISMISS_THRESHOLD = 120;

const ORBIT_SIZE = Math.min(SCREEN_WIDTH - 48, 300);
const ORBIT_RADIUS = ORBIT_SIZE / 2;
const INNER_RING_RADIUS = ORBIT_SIZE * 0.28;
const OUTER_RING_RADIUS = ORBIT_SIZE * 0.5;
const AVATAR_SIZE = 40;
const CIRCLE_CACHE_KEY = 'circle_cache';
const RING_STROKE_WIDTH = 1.5;
const SAFE_GAP = 14;
const INNER_BOUNDARY_GAP = 12;

const OUTER_SAFE_RADIUS =
  OUTER_RING_RADIUS - AVATAR_SIZE / 2 - RING_STROKE_WIDTH - SAFE_GAP;
const INNER_SAFE_RADIUS =
  INNER_RING_RADIUS - AVATAR_SIZE / 2 - RING_STROKE_WIDTH - SAFE_GAP;

const AVATAR_COLORS = [
  '#d9d9d9',
  '#d4c5f9',
  '#c5e8f9',
  '#c5f9d4',
  '#f9d4c5',
  '#f9f0c5',
];

const getBaseUrl = () =>
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://172.19.0.229:3000';

// ─── Types ────────────────────────────────────────────────────────────────────

type Ring = 'inner' | 'outer';
type CircleModalState = 'none' | 'addFriend' | 'addByPhone' | 'notOnTether';

type User = {
  id: string;
  name: string;
  ringLevel: 'close-friends' | 'friends';
  avatar: string;
  handle: string;
  location: string;
  status: string;
};

type FriendNode = {
  user: User;
  ring: Ring;
  color: string;
  x: number;
  y: number;
};

type CircleMember = {
  member_user_id: string;
  circle_type: Ring;
  first_name: string;
  last_name: string;
  phone: string;
  location: string | null;
  bio: string | null;
};

type FoundUser = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchCircle(): Promise<CircleMember[]> {
  const userId = await AsyncStorage.getItem('user_id');
  if (!userId) throw new Error('No user_id in storage');

  const res = await fetch(`${getBaseUrl()}/circle?user_id=${userId}`);

  if (!res.ok) {
    const body = await res.text();
    console.error('fetchCircle failed:', res.status, body);
    throw new Error('Failed to fetch circle');
  }

  const data = await res.json();
  return data.members as CircleMember[];
}

async function updateCircleRing(memberId: string, newRing: Ring): Promise<void> {
  const userId = await AsyncStorage.getItem('user_id');

  const res = await fetch(
    `${getBaseUrl()}/circle/${memberId}?user_id=${encodeURIComponent(
      userId ?? ''
    )}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ circle_type: newRing }),
    }
  );

  if (!res.ok) throw new Error('Failed to update circle ring');
}

async function removeFriendFromCircle(memberId: string): Promise<void> {
  const userId = await AsyncStorage.getItem('user_id');

  const res = await fetch(
    `${getBaseUrl()}/circle/${memberId}?user_id=${encodeURIComponent(
      userId ?? ''
    )}`,
    { method: 'DELETE' }
  );

  if (!res.ok) throw new Error('Failed to remove circle member');
}

// ─── Orbit helpers ────────────────────────────────────────────────────────────

const polarToXY = (angle: number, radius: number) => ({
  x: Math.cos(angle) * radius,
  y: Math.sin(angle) * radius,
});

const clampToOrbit = (x: number, y: number) => {
  const d = Math.sqrt(x * x + y * y);
  if (d === 0) return { x: 0, y: 0 };

  const angle = Math.atan2(y, x);
  const capped = Math.min(d, OUTER_SAFE_RADIUS);

  const innerForbiddenMin = INNER_SAFE_RADIUS;
  const innerForbiddenMax =
    INNER_RING_RADIUS + AVATAR_SIZE / 2 + RING_STROKE_WIDTH + INNER_BOUNDARY_GAP;

  let finalRadius = capped;

  if (capped > innerForbiddenMin && capped < innerForbiddenMax) {
    const midpoint = (innerForbiddenMin + innerForbiddenMax) / 2;
    finalRadius = capped < midpoint ? innerForbiddenMin : innerForbiddenMax;
  }

  return {
    x: Math.cos(angle) * finalRadius,
    y: Math.sin(angle) * finalRadius,
  };
};

// ─── AddSidequestSheet ────────────────────────────────────────────────────────

function AddSidequestSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [visible, translateY]);

  const pan = useRef(
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

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={sh.backdrop} onPress={onClose} />
      <Animated.View style={[sh.container, { transform: [{ translateY }] }]}>
        <View {...pan.panHandlers} style={sh.handleArea}>
          <View style={sh.handle} />
        </View>
        <CreateSidequestForm onClose={onClose} />
      </Animated.View>
    </Modal>
  );
}

// ─── AddFriendModal ───────────────────────────────────────────────────────────

function AddFriendModal({
  visible,
  onClose,
  onByPhone,
  onFromContacts,
}: {
  visible: boolean;
  onClose: () => void;
  onByPhone: () => void;
  onFromContacts: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.card} onPress={() => {}}>
          <Pressable style={s.xBtn} onPress={onClose}>
            <Text style={s.xTxt}>✕</Text>
          </Pressable>

          <Text style={s.cardTitle}>add a friend</Text>
          <Text style={s.cardSub}>grow your circle!</Text>

          <Pressable style={s.optBtn} onPress={onFromContacts}>
            <Text style={s.optTxt}>📋  FROM CONTACTS</Text>
          </Pressable>

          <Pressable style={[s.optBtn, { marginTop: 10 }]} onPress={onByPhone}>
            <Text style={s.optTxt}>📱  BY MOBILE NUMBER</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── AddByPhoneModal ──────────────────────────────────────────────────────────

function AddByPhoneModal({
  visible,
  onClose,
  onBack,
  currentUserId,
}: {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  currentUserId: string | null;
}) {
  const [val, setVal] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!visible) {
      setVal('');
      setSearching(false);
      setFoundUser(null);
      setError('');
      setSent(false);
    }
  }, [visible]);

  const handleSearch = async () => {
    if (!val.trim()) return;

    setSearching(true);
    setFoundUser(null);
    setError('');

    try {
      const digits = val.replace(/\D/g, '');
      const normalized = encodeURIComponent(`+1${digits}`);
      const res = await fetch(`${getBaseUrl()}/users/by-phone/${normalized}`);
      const data = await res.json();

      if (res.ok) {
        if (data.user.id === currentUserId) {
          setError("That's your own number!");
        } else {
          setFoundUser(data.user);
        }
      } else {
        setError('No account found with that number.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSearching(false);
    }
  };



  const handleSendRequest = async () => {
    if (!foundUser) return;

    try {
      const res = await fetch(`${getBaseUrl()}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: currentUserId, receiver_id: foundUser.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || 'Could not send request.');
      }
    } catch {
      setError('Something went wrong.');
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          keyboardVerticalOffset={80}
          style={{ width: '100%', alignItems: 'center' }}
        >
          <Pressable
            style={[
              s.card,
              {
                marginBottom: 40,
                width: '95%',
                maxWidth: 360,
                paddingHorizontal: 28,
                paddingVertical: 30,
              },
            ]}
            onPress={() => {}}
          >
            <Pressable style={s.xBtn} onPress={onClose}>
              <Text style={s.xTxt}>✕</Text>
            </Pressable>

            <Text style={s.cardTitle}>add a friend</Text>
            <Text style={s.cardSub}>enter their mobile number</Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f0ebff',
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: '#1a1a1a',
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginTop: 20,
                width: '100%',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 18 }}>🇺🇸</Text>
              <Text style={{ fontSize: 13, color: '#555' }}>+1</Text>

              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: '#1a1a1a',
                  fontWeight: '600',
                  paddingVertical: 2,
                }}
                placeholder="(555) 000-0000"
                placeholderTextColor="#aaa"
                value={val}
                onChangeText={(t) => {
                  setVal(t);
                  setFoundUser(null);
                  setError('');
                  setSent(false);
                }}
                keyboardType="phone-pad"
                autoFocus
               
              />

              {val.length > 0 && (
                <Pressable
                  onPress={() => {
                    setVal('');
                    setFoundUser(null);
                    setError('');
                  }}
                >
                  <Text style={{ fontSize: 16, color: '#aaa' }}>✕</Text>
                </Pressable>
              )}
            </View>

            {foundUser && !sent && (
              <View
                style={{
                  marginTop: 16,
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderRadius: 12,
                  padding: 14,
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a' }}>
                  👤 {foundUser.first_name} {foundUser.last_name}
                </Text>
                <Text style={{ fontSize: 12, color: '#555' }}>
                  found! send them a request?
                </Text>

                <Pressable onPress={handleSendRequest} style={[s.optBtn, { width: '100%', marginTop: 4 }]}>
                  <Text style={s.optTxt}>✉️  SEND REQUEST</Text>
                </Pressable>
              </View>
            )}

            {sent && (
              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a' }}>
                  ✅ Request sent!
                </Text>
              </View>
            )}

            {error !== '' && (
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: '#c0392b',
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            )}

            {!foundUser && !sent && (
              <Pressable
                onPress={handleSearch}
                style={[
                  s.optBtn,
                  { marginTop: 16, width: '100%', opacity: val.trim() ? 1 : 0.4 },
                ]}
                disabled={!val.trim() || searching}
              >
                <Text style={s.optTxt}>
                  {searching ? '⏳  SEARCHING...' : '🔍  FIND FRIEND'}
                </Text>
              </Pressable>
            )}

            <Pressable onPress={onBack} style={{ marginTop: 14 }}>
              <Text style={s.backTxt}>← BACK</Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// ─── NotOnTetherModal ─────────────────────────────────────────────────────────

function NotOnTetherModal({
  visible,
  name,
  onClose,
  onBack,
}: {
  visible: boolean;
  name: string;
  onClose: () => void;
  onBack: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.card} onPress={() => {}}>
          <Pressable style={s.xBtn} onPress={onClose}>
            <Text style={s.xTxt}>✕</Text>
          </Pressable>

          <Text style={[s.cardTitle, { lineHeight: 30 }]}>
            {'Looks like\n'}
            <Text style={{ fontWeight: '700' }}>{name || 'First Name'}</Text>
            {"\nisn't on tether yet"}
          </Text>

          <Pressable style={[s.optBtn, { marginTop: 16, width: '100%' }]}>
            <Text style={s.optTxt}>✉️  SEND AN INVITE</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── DraggableAvatar ──────────────────────────────────────────────────────────

function DraggableAvatar({
  node,
  isEditing,
  isSelected,
  onSelect,
  onRemove,
  onMove,
  onPressProfile,
}: {
  node: FriendNode;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onPressProfile: (user: User) => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: node.x, y: node.y })).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!dragging.current) pan.setValue({ x: node.x, y: node.y });
  }, [node.x, node.y, pan]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isEditing,
        onStartShouldSetPanResponderCapture: () => isEditing,
        onMoveShouldSetPanResponder: (_, g) =>
          isEditing && (Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2),
        onMoveShouldSetPanResponderCapture: (_, g) =>
          isEditing && (Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2),

        onPanResponderGrant: () => {
          dragging.current = false;
          onSelect(null);

          holdTimer.current = setTimeout(() => {
            if (!dragging.current) onSelect(node.user.id);
          }, 700);

          pan.setOffset({
            x: (pan.x as any).__getValue(),
            y: (pan.y as any).__getValue(),
          });
          pan.setValue({ x: 0, y: 0 });
        },

        onPanResponderMove: (_, gesture) => {
          dragging.current = true;

          if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
          }

          const rawX = (pan.x as any)._offset + gesture.dx;
          const rawY = (pan.y as any)._offset + gesture.dy;
          const next = clampToOrbit(rawX, rawY);

          pan.setValue({
            x: next.x - (pan.x as any)._offset,
            y: next.y - (pan.y as any)._offset,
          });
        },

        onPanResponderRelease: (_, gesture) => {
          if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
          }

          const rawX = (pan.x as any)._offset + gesture.dx;
          const rawY = (pan.y as any)._offset + gesture.dy;
          const next = clampToOrbit(rawX, rawY);

          pan.flattenOffset();
          pan.setValue(next);
          dragging.current = false;
          onMove(node.user.id, next.x, next.y);
        },

        onPanResponderTerminate: () => {
          if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
          }
          pan.flattenOffset();
          dragging.current = false;
        },

        onPanResponderTerminationRequest: () => false,
      }),
    [isEditing, node.user, onMove, onSelect, pan]
  );

  return (
    <Animated.View
      {...(isEditing ? responder.panHandlers : {})}
      style={{
        position: 'absolute',
        left: ORBIT_RADIUS - AVATAR_SIZE / 2,
        top: ORBIT_RADIUS - AVATAR_SIZE / 2,
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        transform: pan.getTranslateTransform(),
        zIndex: isSelected ? 99 : 2,
      }}
    >
      <Pressable
        onPress={() => {
          if (isEditing) return;
          onPressProfile(node.user);
        }}
        style={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          borderRadius: AVATAR_SIZE / 2,
          backgroundColor: node.color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: isEditing ? 1.5 : 0,
          borderColor: isSelected ? '#ff4444' : '#aaa',
        }}
      >
        <Text style={{ fontSize: 17 }}>{node.user.avatar}</Text>
      </Pressable>

      {isEditing && isSelected && (
        <Pressable
          onPress={() => onRemove(node.user.id)}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#ff4444',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>✕</Text>
        </Pressable>
      )}

      {isEditing && isSelected && (
        <View
          style={{
            position: 'absolute',
            bottom: AVATAR_SIZE + 6,
            left: -42,
            backgroundColor: '#fff',
            borderRadius: 20,
            paddingVertical: 4,
            paddingHorizontal: 10,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 4,
            minWidth: 130,
          }}
        >
          <Text style={{ fontSize: 10, color: '#333', fontWeight: '600' }}>
            ✕ Remove from orbit
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// ─── OrbitView ────────────────────────────────────────────────────────────────

function OrbitView({
  nodes,
  isEditing,
  selectedId,
  onSelect,
  onRemove,
  onMove,
  onPressProfile,
}: {
  nodes: FriendNode[];
  isEditing: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onPressProfile: (user: User) => void;
}) {
  const innerDiameter = INNER_RING_RADIUS * 2;

  return (
    <Pressable
      onPress={() => onSelect(null)}
      style={{
        width: ORBIT_SIZE,
        height: ORBIT_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <View
          style={{
            width: ORBIT_SIZE,
            height: ORBIT_SIZE,
            borderRadius: ORBIT_RADIUS,
            borderWidth: RING_STROKE_WIDTH,
            borderColor: '#ccc',
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: innerDiameter,
            height: innerDiameter,
            borderRadius: INNER_RING_RADIUS,
            borderWidth: RING_STROKE_WIDTH,
            borderColor: '#ccc',
          }}
        />
      </View>

      <Text style={[s.ringLabel, { top: ORBIT_SIZE * 0.72, left: ORBIT_SIZE * 0.3 }]}>
        INNER RING
      </Text>
      <Text style={[s.ringLabel, { top: ORBIT_SIZE * 0.89, left: ORBIT_SIZE * 0.02 }]}>
        OUTER RING
      </Text>

      {nodes.map((node) => (
        <DraggableAvatar
          key={node.user.id}
          node={node}
          isEditing={isEditing}
          isSelected={selectedId === node.user.id}
          onSelect={onSelect}
          onRemove={onRemove}
          onMove={onMove}
          onPressProfile={onPressProfile}
        />
      ))}
    </Pressable>
  );
}

// ─── CirclePage ───────────────────────────────────────────────────────────────

export default function CirclePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<NavTabId>('circle');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modal, setModal] = useState<CircleModalState>('none');
  const [searchedName, setSearchedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<FriendNode[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const prevRingRef = useRef<Record<string, Ring>>({});

  useEffect(() => {
    AsyncStorage.getItem('user_id').then(setCurrentUserId);
  }, []);

useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      setError(null);

      // Load from cache first for instant display
      const cached = await AsyncStorage.getItem(CIRCLE_CACHE_KEY);
      if (cached && !cancelled) {
        setNodes(JSON.parse(cached));
        setLoading(false);
      }

      // Then fetch fresh data in background
      const members = await fetchCircle();
      if (cancelled) return;

const freshNodes: FriendNode[] = members.map((m, i) => {
  const ring: Ring = m.circle_type;

  // Use cached position if available, otherwise calculate default
  const cachedNode = cached
    ? (JSON.parse(cached) as FriendNode[]).find(
        (n) => n.user.id === m.member_user_id
      )
    : null;

  const x = cachedNode?.x ?? polarToXY(
    (i / Math.max(members.length, 1)) * Math.PI * 2,
    ring === 'inner' ? INNER_SAFE_RADIUS * 0.72 : OUTER_SAFE_RADIUS * 0.72
  ).x;

  const y = cachedNode?.y ?? polarToXY(
    (i / Math.max(members.length, 1)) * Math.PI * 2,
    ring === 'inner' ? INNER_SAFE_RADIUS * 0.72 : OUTER_SAFE_RADIUS * 0.72
  ).y;

  const user: User = {
    id: m.member_user_id,
    name: `${m.first_name} ${m.last_name}`,
    ringLevel: ring === 'inner' ? 'close-friends' : 'friends',
    avatar: '🙂',
    handle: `@${m.first_name.toLowerCase()}`,
    location: m.location ?? '',
    status: m.bio ?? '',
  };

  prevRingRef.current[m.member_user_id] = ring;

  return {
    user,
    ring,
    color: cachedNode?.color ?? AVATAR_COLORS[i % AVATAR_COLORS.length],
    x,
    y,
  };
});

      if (!cancelled) {
        setNodes(freshNodes);
        await AsyncStorage.setItem(CIRCLE_CACHE_KEY, JSON.stringify(freshNodes));
      }
    } catch (err) {
      console.error('Circle load error:', err);
      if (!cancelled) setError('Could not load your circle. Pull to retry.');
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  load();

  return () => { cancelled = true; };
}, []);

const handleRemove = async (id: string) => {
  setNodes((prev) => {
    const updated = prev.filter((n) => n.user.id !== id);
    AsyncStorage.setItem(CIRCLE_CACHE_KEY, JSON.stringify(updated));
    return updated;
  });
  setSelectedId(null);
  delete prevRingRef.current[id];

  try {
    await removeFriendFromCircle(id);
  } catch {
    console.error('Failed to remove friend from circle in DB');
  }
};
const handleMove = async (id: string, x: number, y: number) => {
  const d = Math.sqrt(x * x + y * y);
  // Use the midpoint between inner and outer ring radii as the boundary
  const ringBoundary = (INNER_RING_RADIUS + OUTER_RING_RADIUS) / 2;
  const newRing: Ring = d <= ringBoundary ? 'inner' : 'outer';
  const oldRing = prevRingRef.current[id];

  setNodes((prev) => {
    const updated = prev.map((n) => (n.user.id !== id ? n : { ...n, x, y, ring: newRing }));
    AsyncStorage.setItem(CIRCLE_CACHE_KEY, JSON.stringify(updated));
    return updated;
  });

  if (newRing !== oldRing) {
    prevRingRef.current[id] = newRing;

    try {
      await updateCircleRing(id, newRing);
    } catch {
      console.error('Failed to update ring in DB — rolling back');

      setNodes((prev) => {
        const rolled = prev.map((n) => (n.user.id !== id ? n : { ...n, ring: oldRing }));
        AsyncStorage.setItem(CIRCLE_CACHE_KEY, JSON.stringify(rolled));
        return rolled;
      });

      prevRingRef.current[id] = oldRing;
    }
  }
};
  const handleFromContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Please allow contacts access in your phone settings.'
      );
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.FirstName,
        Contacts.Fields.LastName,
      ],
    });

    if (!data.length) {
      Alert.alert('No contacts found');
      return;
    }

    const contact = await Contacts.presentContactPickerAsync();
    if (!contact) return;

    const phone = contact.phoneNumbers?.[0]?.number;

    if (!phone) {
      Alert.alert(
        'No phone number',
        `${contact.firstName} doesn't have a phone number saved.`
      );
      return;
    }

    setSearchedName(contact.firstName || '');
    setModal('addByPhone');
  };

  const handleOpenProfile = (user: User) => {
    router.push({
      pathname: '/friendprofile',
      params: {
        userId: user.id,
        name: user.name,
        handle: user.handle,
        location: user.location,
        status: user.status,
        avatar: user.avatar,
        ringLevel: user.ringLevel,
      },
    });
  };

  const handleTabPress = (tab: NavTabId) => {
    setActiveTab(tab);

    switch (tab) {
      case 'home':
        router.push('/homepage');
        break;
      case 'profile':
        router.push('/myprofile');
        break;
      default:
        break;
    }
  };

  const stopEditing = () => {
    setIsEditing(false);
    setSelectedId(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
        <ScrollView
          contentContainerStyle={s.page}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isEditing}
        >
          {isEditing && <Text style={s.editTopLabel}>EDIT ORBIT</Text>}
          <Text style={s.title}>{isEditing ? 'your orbit' : 'your circle'}</Text>

          {loading ? (
            <Text style={{ color: '#aaa', fontSize: 13, marginTop: 40 }}>
              Loading your circle...
            </Text>
          ) : error ? (
            <Text style={{ color: '#f00', fontSize: 13, marginTop: 40 }}>{error}</Text>
          ) : (
            <>
              <View style={{ marginTop: 24, marginBottom: 20 }}>
                <OrbitView
                  nodes={nodes}
                  isEditing={isEditing}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onRemove={handleRemove}
                  onMove={handleMove}
                  onPressProfile={handleOpenProfile}
                />
              </View>

              {nodes.length === 0 && !isEditing && (
                <Text
                  style={{
                    color: '#bbb',
                    fontSize: 13,
                    textAlign: 'center',
                  }}
                >
                  Your orbit is empty.{'\n'}Add friends to get started!
                </Text>
              )}

              {isEditing ? (
                <View
                  style={{
                    width: '100%',
                    maxWidth: 320,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                  }}
                >
                  <Text style={s.instrText}>TAP AND DRAG TO MOVE PEOPLE WITHIN RINGS</Text>
                  <Text style={s.instrText}>TAP AND HOLD A PERSON FOR MORE OPTIONS</Text>

                  <Pressable style={s.saveBtn} onPress={stopEditing}>
                    <Text style={s.saveTxt}>SAVE CHANGES</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={s.actions}>
                  <Pressable onPress={() => setModal('addFriend')}>
                    <Text style={s.linkBtn}>+ ADD FRIEND</Text>
                  </Pressable>

                  <Pressable onPress={() => setIsEditing(true)}>
                    <Text style={s.linkBtn}>✏ EDIT ORBIT</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabPress}
        onAddPress={() => setSheetOpen(true)}
      />

      <AddSidequestSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />

      <AddFriendModal
        visible={modal === 'addFriend'}
        onClose={() => setModal('none')}
        onByPhone={() => setModal('addByPhone')}
        onFromContacts={handleFromContacts}
      />

      <AddByPhoneModal
        visible={modal === 'addByPhone'}
        onClose={() => setModal('none')}
        onBack={() => setModal('addFriend')}
        currentUserId={currentUserId}
      />

      <NotOnTetherModal
        visible={modal === 'notOnTether'}
        name={searchedName}
        onClose={() => setModal('none')}
        onBack={() => setModal('addByPhone')}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    alignItems: 'center',
    paddingBottom: 140,
  },
  editTopLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#aaa',
    textTransform: 'uppercase',
    marginTop: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  ringLabel: {
    position: 'absolute',
    fontSize: 9,
    color: '#bbb',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  instrText: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginVertical: 2,
    textAlign: 'center',
  },
  saveBtn: {
    width: '100%',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  saveTxt: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#1a1a1a',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 16,
  },
  linkBtn: {
    fontSize: 12,
    color: '#1a1a1a',
    letterSpacing: 1,
    fontWeight: '500',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'flex-end',
    paddingBottom: 100,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#c4b5fd',
    borderRadius: 20,
    padding: 28,
    width: '88%',
    maxWidth: 390,
    alignItems: 'center',
  },
  xBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    padding: 4,
  },
  xTxt: {
    fontSize: 16,
    color: '#555',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 8,
  },
  cardSub: {
    fontSize: 14,
    color: '#444',
    marginTop: 6,
    marginBottom: 4,
    textAlign: 'center',
  },
  optBtn: {
    borderWidth: 1.5,
    borderColor: '#1a1a1a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
  },
  optTxt: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#1a1a1a',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1a1a1a',
    marginTop: 20,
    paddingBottom: 6,
    gap: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    paddingVertical: 4,
  },
  backTxt: {
    fontSize: 11,
    color: '#555',
    letterSpacing: 1,
  },
});

const sh = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleArea: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
  },
});