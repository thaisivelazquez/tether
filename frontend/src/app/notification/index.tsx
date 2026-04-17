import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    GestureResponderEvent,
    PanResponder,
    PanResponderGestureState,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navbar, NavTabId } from '../../../components/navbar/navbar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 390;
const rs = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const SWIPE_THRESHOLD = 80;

const getBaseUrl = () =>
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://172.19.8.233:3000';

type FriendRequest = {
  id: string;
  type: 'friend_request';
  sender_id: string;
  first_name: string;
  last_name: string;
  phone: string;
};

type EventNotification = {
  id: string;
  type: 'event';
  event_title: string;
  event_des: string;
  location: string;
  time_of_event: string;
  circle_status: 'everyone' | 'close-friends';
  creator_first_name: string;
  creator_last_name: string;
};

type NotificationItem = FriendRequest | EventNotification;

function SwipeableCard({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;

  const deleteOpacity = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, -SWIPE_THRESHOLD, 0],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _: GestureResponderEvent,
        g: PanResponderGestureState
      ) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        if (g.dx < 0) translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 220,
            useNativeDriver: true,
          }).start(onDelete);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ marginBottom: rs(12) }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: '#ff4444',
            borderRadius: rs(16),
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: rs(20),
            opacity: deleteOpacity,
          },
        ]}
      >
        <Text style={{ color: '#fff', fontSize: rs(13), fontWeight: '700' }}>🗑 DELETE</Text>
      </Animated.View>

      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX }] }}>
        {children}
      </Animated.View>
    </View>
  );
}

function FriendRequestCard({
  item,
  onAccept,
  onDecline,
  onDelete,
}: {
  item: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
  onDelete: () => void;
}) {
  return (
    <SwipeableCard onDelete={onDelete}>
      <View style={n.card}>
        <View style={n.cardTop}>
          <View style={n.iconCircle}>
            <Text style={{ fontSize: rs(18) }}>👤</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={n.cardTitle}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={n.cardSub}>wants to add you to their circle</Text>
          </View>

          <View style={n.tag}>
            <Text style={n.tagTxt}>REQUEST</Text>
          </View>
        </View>

        <View style={n.btnRow}>
          <Pressable
            onPress={onAccept}
            style={({ pressed }) => [n.acceptBtn, pressed && { opacity: 0.75 }]}
          >
            <Text style={n.acceptTxt}>✓ ACCEPT</Text>
          </Pressable>

          <Pressable
            onPress={onDecline}
            style={({ pressed }) => [n.declineBtn, pressed && { opacity: 0.75 }]}
          >
            <Text style={n.declineTxt}>✕ DECLINE</Text>
          </Pressable>
        </View>
      </View>
    </SwipeableCard>
  );
}

function EventCard({
  item,
  onDelete,
}: {
  item: EventNotification;
  onDelete: () => void;
}) {
  const isCloseFriends = item.circle_status === 'close-friends';
  const date = new Date(item.time_of_event);

  const formattedDate = date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SwipeableCard onDelete={onDelete}>
      <View style={n.card}>
        <View style={n.cardTop}>
          <View style={n.iconCircle}>
            <Text style={{ fontSize: rs(18) }}>📅</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={n.cardTitle}>{item.event_title}</Text>
            <Text style={n.cardSub}>
              posted by {item.creator_first_name} {item.creator_last_name}
            </Text>
          </View>

          <View style={[n.tag, isCloseFriends ? n.tagCF : n.tagAll]}>
            <Text style={n.tagTxt}>{isCloseFriends ? '🔒 INNER' : '🌍 ALL'}</Text>
          </View>
        </View>

        {!!item.event_des && <Text style={n.cardDesc}>{item.event_des}</Text>}

        <View style={n.metaRow}>
          <Text style={n.meta}>📅 {formattedDate}  ⏰ {formattedTime}</Text>
        </View>

        {!!item.location && (
          <View style={n.metaRow}>
            <Text style={n.meta}>📍 {item.location}</Text>
          </View>
        )}
      </View>
    </SwipeableCard>
  );
}

export default function NotificationsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<NavTabId>('bell');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) return;

    try {
      setLoading(true);

      const [reqRes, evtRes] = await Promise.all([
        fetch(`${getBaseUrl()}/friends/requests?user_id=${userId}`),
        fetch(`${getBaseUrl()}/events?user_id=${userId}`),
      ]);

      const reqData = reqRes.ok ? await reqRes.json() : { requests: [] };
      const evtData = evtRes.ok ? await evtRes.json() : [];

      const friendRequests: FriendRequest[] = (reqData.requests ?? []).map((r: any) => ({
        ...r,
        type: 'friend_request' as const,
      }));

      const eventNotifs: EventNotification[] = (Array.isArray(evtData) ? evtData : []).map((e: any) => ({
        id: e.id,
        type: 'event' as const,
        event_title: e.title ?? e.event_title ?? '',
        event_des: e.description ?? e.event_des ?? '',
        location: e.location ?? '',
        time_of_event: e.startTime ?? e.time_of_event ?? '',
        circle_status: e.circleStatus ?? e.circle_status ?? 'everyone',
        creator_first_name: e.postedBy?.name?.split(' ')[0] ?? e.creator_first_name ?? '',
        creator_last_name: e.postedBy?.name?.split(' ')[1] ?? e.creator_last_name ?? '',
      }));

      setNotifications([...friendRequests, ...eventNotifs]);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleAccept = async (item: FriendRequest) => {
    try {
      await fetch(`${getBaseUrl()}/friends/requests/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });

      setNotifications((prev) =>
        prev.filter((nItem) => !(nItem.type === 'friend_request' && nItem.id === item.id))
      );
    } catch (err) {
      console.error('Accept failed:', err);
    }
  };

  const handleDecline = async (item: FriendRequest) => {
    try {
      await fetch(`${getBaseUrl()}/friends/requests/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' }),
      });

      setNotifications((prev) =>
        prev.filter((nItem) => !(nItem.type === 'friend_request' && nItem.id === item.id))
      );
    } catch (err) {
      console.error('Decline failed:', err);
    }
  };

  const handleDelete = (id: string, type: NotificationItem['type']) => {
    setNotifications((prev) => prev.filter((item) => !(item.id === id && item.type === type)));
  };

  const handleTabPress = (tab: NavTabId) => {
    setActiveTab(tab);

    switch (tab) {
      case 'home':
        router.push('/homepage');
        break;
      case 'circle':
        router.push('/circle');
        break;
      case 'profile':
        router.push('/myprofile');
        break;
      case 'bell':
        router.push('/notification');
        break;
      default:
        break;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: rs(20), paddingTop: rs(16), paddingBottom: rs(8) }}>
          <Text style={n.pageTitle}>notifications</Text>
          {notifications.length > 0 && <Text style={n.pageSub}>{notifications.length} new</Text>}
        </View>

        {loading ? (
          <Text style={n.empty}>Loading...</Text>
        ) : notifications.length === 0 ? (
          <Text style={n.empty}>you're all caught up 🎉</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            contentContainerStyle={{
              paddingHorizontal: rs(16),
              paddingBottom: rs(140),
              paddingTop: rs(8),
            }}
            renderItem={({ item }) => {
              if (item.type === 'friend_request') {
                return (
                  <FriendRequestCard
                    item={item}
                    onAccept={() => handleAccept(item)}
                    onDecline={() => handleDecline(item)}
                    onDelete={() => handleDelete(item.id, item.type)}
                  />
                );
              }

              return (
                <EventCard
                  item={item}
                  onDelete={() => handleDelete(item.id, item.type)}
                />
              );
            }}
          />
        )}
      </SafeAreaView>

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddPress={() => {}}
      />
    </View>
  );
}

const n = StyleSheet.create({
  pageTitle: {
    fontSize: rs(28),
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  pageSub: {
    fontSize: rs(13),
    color: '#999',
    marginTop: rs(2),
  },
  empty: {
    textAlign: 'center',
    marginTop: rs(60),
    color: '#aaa',
    fontSize: rs(14),
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: rs(16),
    padding: rs(16),
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    marginBottom: rs(8),
  },
  iconCircle: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: rs(14),
    fontWeight: '700',
    color: '#fff',
  },
  cardSub: {
    fontSize: rs(12),
    color: '#777',
    marginTop: rs(2),
  },
  cardDesc: {
    fontSize: rs(13),
    color: '#999',
    marginBottom: rs(8),
    lineHeight: rs(18),
  },
  tag: {
    backgroundColor: '#2a2a2a',
    borderRadius: 999,
    paddingHorizontal: rs(8),
    paddingVertical: rs(3),
  },
  tagCF: {
    backgroundColor: '#2d1f3d',
  },
  tagAll: {
    backgroundColor: '#1a2d1f',
  },
  tagTxt: {
    fontSize: rs(10),
    fontWeight: '700',
    color: '#c8b1db',
    letterSpacing: 0.5,
  },
  metaRow: {
    marginTop: rs(4),
  },
  meta: {
    fontSize: rs(12),
    color: '#777',
  },
  btnRow: {
    flexDirection: 'row',
    gap: rs(10),
    marginTop: rs(12),
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#c4b5fd',
    borderRadius: rs(8),
    paddingVertical: rs(10),
    alignItems: 'center',
  },
  acceptTxt: {
    fontSize: rs(11),
    fontWeight: '700',
    letterSpacing: 1,
    color: '#1a1a1a',
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#444',
    borderRadius: rs(8),
    paddingVertical: rs(10),
    alignItems: 'center',
  },
  declineTxt: {
    fontSize: rs(11),
    fontWeight: '700',
    letterSpacing: 1,
    color: '#777',
  },
});