import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
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

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DISMISS_THRESHOLD = 120;

const ORBIT_SIZE = Math.min(SCREEN_WIDTH - 48, 300);
const ORBIT_RADIUS = ORBIT_SIZE / 2;
const INNER_RING_RADIUS = ORBIT_SIZE * 0.28;
const OUTER_RING_RADIUS = ORBIT_SIZE * 0.5;
const AVATAR_SIZE = 40;

const RING_STROKE_WIDTH = 1.5;
const SAFE_GAP = 14;
const INNER_BOUNDARY_GAP = 12;

const OUTER_SAFE_RADIUS =
  OUTER_RING_RADIUS - AVATAR_SIZE / 2 - RING_STROKE_WIDTH - SAFE_GAP;

const INNER_SAFE_RADIUS =
  INNER_RING_RADIUS - AVATAR_SIZE / 2 - RING_STROKE_WIDTH - SAFE_GAP;

type RingLevel = 'friends' | 'close-friends';
type Ring = 'inner' | 'outer';

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

type CircleModalState = 'none' | 'addFriend' | 'addByPhone' | 'notOnTether';

type FriendNode = {
  user: User;
  ring: Ring;
  color: string;
  x: number;
  y: number;
};

const mockUsers: User[] = [
  { id: 'u1', name: 'Alice', ringLevel: 'close-friends', avatar: '👩', handle: '@alice', location: 'NYC', status: 'Hey there!' },
  { id: 'u2', name: 'Bob', ringLevel: 'friends', avatar: '🧑', handle: '@bob', location: 'SF', status: 'Ready to party!' },
  { id: 'u3', name: 'Cara', ringLevel: 'close-friends', avatar: '👱', handle: '@cara', location: 'LA', status: 'Living my best life' },
  { id: 'u4', name: 'Dan', ringLevel: 'friends', avatar: '🧔', handle: '@dan', location: 'ATL', status: 'Chillin 🤙' },
  { id: 'u5', name: 'Eva', ringLevel: 'close-friends', avatar: '🙋', handle: '@eva', location: 'NYC', status: 'Always down' },
];

const now = new Date();
const fmt = (offsetHours: number) =>
  new Date(now.getTime() + offsetHours * 3600 * 1000).toISOString();

const mockSidequests: Sidequest[] = [
  {
    id: 'sq1',
    title: 'Rooftop Drinks 🍹',
    description: 'Casual drinks on my rooftop!',
    visibility: 'close-friends',
    postedBy: mockUsers[0],
    attendees: [mockUsers[1]],
    createdAt: fmt(-1),
    startTime: fmt(2),
    endTime: fmt(5),
    location: '123 Main St',
    maxAttendees: 10,
  },
  {
    id: 'sq2',
    title: 'Pickup Basketball 🏀',
    description: 'Pickup game at the park.',
    visibility: 'everyone',
    postedBy: mockUsers[1],
    attendees: [mockUsers[3]],
    createdAt: fmt(-2),
    startTime: fmt(3),
    endTime: fmt(5),
    location: 'Riverside Park',
    maxAttendees: 10,
  },
  {
    id: 'sq3',
    title: 'Brunch Run 🥞',
    description: 'New brunch spot on 5th!',
    visibility: 'close-friends',
    postedBy: mockUsers[2],
    attendees: [mockUsers[0]],
    createdAt: fmt(-3),
    startTime: fmt(1),
    endTime: fmt(3),
    location: '5th Ave Café',
    maxAttendees: 6,
  },
];

const AVATAR_COLORS = ['#d9d9d9', '#d4c5f9', '#c5e8f9', '#c5f9d4', '#f9d4c5', '#f9f0c5'];

const dist = (x: number, y: number) => Math.sqrt(x * x + y * y);

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

const polarToXY = (angle: number, radius: number) => ({
  x: Math.cos(angle) * radius,
  y: Math.sin(angle) * radius,
});

function AddSidequestSheet({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (s: Sidequest) => void;
}) {
  const insets = useSafeAreaInsets();
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

  React.useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [visible, translateY]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 1.5) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 220,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
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

  const handleSubmit = () => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(15, 0, 0, 0);
    const end = new Date(start.getTime() + 7200000);

    onAdd({
      id: `sq-${Date.now()}`,
      title: title.trim() || 'share what you are up to',
      description: detail.trim() || 'Tell your friends what to expect.',
      visibility: vis,
      postedBy: mockUsers[0],
      attendees: [],
      createdAt: new Date().toISOString(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      location: location.trim() || 'NYC',
      maxAttendees: Math.max(1, parseInt(maxAtt, 10) || 1),
    });

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
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={sh.backdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={sh.kav} pointerEvents="box-none">
        <Animated.View style={[sh.container, { paddingBottom: insets.bottom + 16 }, { transform: [{ translateY }] }]}>
          <View {...pan.panHandlers} style={sh.handleArea}>
            <View style={sh.handle} />
          </View>
          <Text style={sh.label}>CREATE SIDEQUEST</Text>
          <ScrollView
            style={sh.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          >
            <TextInput style={sh.bigInput} placeholder="share what you're up to..." placeholderTextColor="#666" value={title} onChangeText={setTitle} />
            <Text style={sh.lab}>FROM</Text>
            <View style={sh.row}>
              <TextInput style={sh.pill} placeholder="date" placeholderTextColor="#666" value={fromDate} onChangeText={setFromDate} />
              <TextInput style={sh.pill} placeholder="time" placeholderTextColor="#666" value={fromTime} onChangeText={setFromTime} />
            </View>
            <Text style={sh.lab}>TO</Text>
            <View style={sh.row}>
              <TextInput style={sh.pill} placeholder="date" placeholderTextColor="#666" value={toDate} onChangeText={setToDate} />
              <TextInput style={sh.pill} placeholder="time" placeholderTextColor="#666" value={toTime} onChangeText={setToTime} />
            </View>
            <TextInput style={sh.input} placeholder="📍 location" placeholderTextColor="#666" value={location} onChangeText={setLocation} />
            <TextInput style={[sh.input, sh.multi]} placeholder="TELL YOUR FRIENDS WHAT TO EXPECT..." placeholderTextColor="#666" value={detail} onChangeText={setDetail} multiline />
            <Text style={sh.lab}>MAX ATTENDEES</Text>
            <TextInput style={sh.input} keyboardType="number-pad" placeholderTextColor="#666" value={maxAtt} onChangeText={setMaxAtt} />
            <Text style={sh.lab}>VISIBILITY</Text>
            <Pressable style={sh.input} onPress={() => setOpenVis(v => !v)}>
              <Text style={{ color: '#fff' }}>{vis === 'everyone' ? 'Everyone' : 'Close Friends'}</Text>
            </Pressable>
            {openVis && (
              <View style={sh.dropdown}>
                <Pressable onPress={() => { setVis('close-friends'); setOpenVis(false); }} style={sh.opt}>
                  <Text style={sh.optTxt}>Close Friends</Text>
                </Pressable>
                <Pressable onPress={() => { setVis('everyone'); setOpenVis(false); }} style={sh.opt}>
                  <Text style={sh.optTxt}>Everyone</Text>
                </Pressable>
              </View>
            )}
            <Pressable onPress={handleSubmit} style={({ pressed }) => [sh.submit, pressed && { opacity: 0.75 }]}>
              <Text style={sh.submitTxt}>share →</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

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

function AddByPhoneModal({
  visible,
  onClose,
  onBack,
  onSearch,
}: {
  visible: boolean;
  onClose: () => void;
  onBack: () => void;
  onSearch: (v: string) => void;
}) {
  const [val, setVal] = useState('');

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.card} onPress={() => {}}>
          <Pressable style={s.xBtn} onPress={onClose}>
            <Text style={s.xTxt}>✕</Text>
          </Pressable>
          <Text style={s.cardTitle}>add a friend</Text>
          <Text style={s.cardSub}>grow your orbit!</Text>
          <View style={s.phoneRow}>
            <Text style={{ fontSize: 14 }}>🇺🇸 ▾</Text>
            <TextInput
              style={s.phoneInput}
              placeholder="Mobile number..."
              placeholderTextColor="#888"
              value={val}
              onChangeText={setVal}
              keyboardType="phone-pad"
              autoFocus
            />
            <Pressable onPress={() => onSearch(val)}>
              <Text style={{ fontSize: 18 }}>🔍</Text>
            </Pressable>
          </View>
          <Pressable onPress={onBack} style={{ marginTop: 14 }}>
            <Text style={s.backTxt}>← BACK</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
          <Pressable onPress={onBack} style={{ marginTop: 14 }}>
            <Text style={s.backTxt}>← BACK</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DraggableAvatar({
  node,
  isEditing,
  isSelected,
  onSelect,
  onRemove,
  onMove,
}: {
  node: FriendNode;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: node.x, y: node.y })).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragging = useRef(false);

  React.useEffect(() => {
    if (!dragging.current) {
      pan.setValue({ x: node.x, y: node.y });
    }
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
            if (!dragging.current) {
              onSelect(node.user.id);
            }
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
    [isEditing, node.user.id, onMove, onSelect, pan]
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
      <View
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
      </View>

      {isSelected && (
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

      {isSelected && (
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

function OrbitView({
  nodes,
  isEditing,
  selectedId,
  onSelect,
  onRemove,
  onMove,
}: {
  nodes: FriendNode[];
  isEditing: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}) {
  const innerDiameter = INNER_RING_RADIUS * 2;

  return (
    <Pressable
      onPress={() => onSelect(null)}
      style={{ width: ORBIT_SIZE, height: ORBIT_SIZE, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
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

      <Text style={[s.ringLabel, { top: ORBIT_SIZE * 0.72, left: ORBIT_SIZE * 0.30 }]}>INNER RING</Text>
      <Text style={[s.ringLabel, { top: ORBIT_SIZE * 0.89, left: ORBIT_SIZE * 0.02 }]}>OUTER RING</Text>

      {nodes.map(node => (
        <DraggableAvatar
          key={node.user.id}
          node={node}
          isEditing={isEditing}
          isSelected={selectedId === node.user.id}
          onSelect={onSelect}
          onRemove={onRemove}
          onMove={onMove}
        />
      ))}
    </Pressable>
  );
}

export default function CirclePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<NavTabId>('circle');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modal, setModal] = useState<CircleModalState>('none');
  const [searchedName, setSearchedName] = useState('');
  const [sidequests, setSidequests] = useState<Sidequest[]>(mockSidequests);

  const [nodes, setNodes] = useState<FriendNode[]>(() =>
    mockUsers.map((u, i) => {
      const angle = (i / mockUsers.length) * Math.PI * 2;
      const ring = u.ringLevel === 'close-friends' ? 'inner' : 'outer';
      const radius = ring === 'inner' ? INNER_SAFE_RADIUS * 0.72 : OUTER_SAFE_RADIUS * 0.72;
      const { x, y } = polarToXY(angle, radius);
      return { user: u, ring, color: AVATAR_COLORS[i % AVATAR_COLORS.length], x, y };
    })
  );

  const handleRemove = (id: string) => {
    setNodes(prev => prev.filter(n => n.user.id !== id));
    setSelectedId(null);
  };

  const handleMove = (id: string, x: number, y: number) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.user.id !== id) return n;
        const d = Math.sqrt(x * x + y * y);
        const ring: Ring = d <= INNER_SAFE_RADIUS ? 'inner' : 'outer';
        return { ...n, x, y, ring };
      })
    );
  };

  const handleSearch = (val: string) => {
    setSearchedName(val || 'First Name');
    setModal('notOnTether');
  };

  const handleAddSidequest = useCallback((sq: Sidequest) => {
    setSidequests(prev => [sq, ...prev]);
  }, []);

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

          <View style={{ marginTop: 24, marginBottom: 20 }}>
            <OrbitView
              nodes={nodes}
              isEditing={isEditing}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onRemove={handleRemove}
              onMove={handleMove}
            />
          </View>

          {isEditing ? (
            <View style={{ width: '100%', maxWidth: 320, paddingHorizontal: 24, alignItems: 'center' }}>
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
        </ScrollView>
      </SafeAreaView>

      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabPress}
        onAddPress={() => setSheetOpen(true)}
      />

      <AddSidequestSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onAdd={handleAddSidequest} />
      <AddFriendModal visible={modal === 'addFriend'} onClose={() => setModal('none')} onByPhone={() => setModal('addByPhone')} onFromContacts={() => setModal('none')} />
      <AddByPhoneModal visible={modal === 'addByPhone'} onClose={() => setModal('none')} onBack={() => setModal('addFriend')} onSearch={handleSearch} />
      <NotOnTetherModal visible={modal === 'notOnTether'} name={searchedName} onClose={() => setModal('none')} onBack={() => setModal('addByPhone')} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { alignItems: 'center', paddingBottom: 140 },
  editTopLabel: { fontSize: 10, letterSpacing: 2, color: '#aaa', textTransform: 'uppercase', marginTop: 14 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a1a', marginTop: 16, letterSpacing: -0.5 },
  ringLabel: { position: 'absolute', fontSize: 9, color: '#bbb', letterSpacing: 1.5, textTransform: 'uppercase' },
  instrText: { fontSize: 10, color: '#999', letterSpacing: 1, textTransform: 'uppercase', marginVertical: 2, textAlign: 'center' },
  saveBtn: { width: '100%', paddingVertical: 14, borderWidth: 1.5, borderColor: '#1a1a1a', borderRadius: 4, alignItems: 'center', marginTop: 16 },
  saveTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: '#1a1a1a' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 320, paddingHorizontal: 16 },
  linkBtn: { fontSize: 12, color: '#1a1a1a', letterSpacing: 1, fontWeight: '500', paddingVertical: 8, paddingHorizontal: 4 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.12)', justifyContent: 'flex-end', paddingBottom: 100, alignItems: 'center' },
  card: { backgroundColor: '#c4b5fd', borderRadius: 20, padding: 28, width: '88%', maxWidth: 340, alignItems: 'center' },
  xBtn: { position: 'absolute', top: 14, right: 16, padding: 4 },
  xTxt: { fontSize: 16, color: '#555' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginTop: 8 },
  cardSub: { fontSize: 14, color: '#444', marginTop: 6, marginBottom: 4, textAlign: 'center' },
  optBtn: { borderWidth: 1.5, borderColor: '#1a1a1a', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20, width: '100%', alignItems: 'center', marginTop: 6 },
  optTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: '#1a1a1a' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', width: '100%', borderBottomWidth: 1.5, borderBottomColor: '#1a1a1a', marginTop: 20, paddingBottom: 6, gap: 8 },
  phoneInput: { flex: 1, fontSize: 14, color: '#1a1a1a', paddingVertical: 4 },
  backTxt: { fontSize: 11, color: '#555', letterSpacing: 1 },
});

const sh = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  kav: { flex: 1, justifyContent: 'flex-end' },
  container: { height: SHEET_HEIGHT, backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handleArea: { alignItems: 'center', paddingVertical: 14 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#444' },
  label: { textAlign: 'center', color: '#888', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 16 },
  scroll: { flex: 1 },
  bigInput: { borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, marginBottom: 16 },
  lab: { color: '#888', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  pill: { flex: 1, borderWidth: 1, borderColor: '#333', borderRadius: 999, padding: 10, color: '#fff', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#333', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, marginBottom: 10 },
  multi: { minHeight: 100, textAlignVertical: 'top' },
  dropdown: { borderWidth: 1, borderColor: '#333', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  opt: { paddingVertical: 10 },
  optTxt: { color: '#fff', fontSize: 14 },
  submit: { backgroundColor: '#4f46e5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});