import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
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

const getBaseUrl = () => {
  if (!__DEV__) return 'https://tether-production-c60a.up.railway.app';
  return Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://172.19.10.138:3000';
};

type FriendRequest = {
  id: string;
  type: 'friend_request';
  sender_id: string;
  first_name: string;
  last_name: string;
  phone: string;
};

type EventNotification = {
  id: string;                              // notification uuid
  sidequest_id: string;
  type: 'event';
  event_title: string;
  event_des: string;
  location: string;
  time_of_event: string;
  circle_status: 'everyone' | 'close-friends';
  creator_first_name: string;
  creator_last_name: string;
  is_read: boolean;
};

type NotificationItem = FriendRequest | EventNotification;
// ─── Time-based gradient background ────────────────────────────────────────

type ThemeSpec = {
  gradient: [string, string];
};

function getThemeForTime(date: Date = new Date()): ThemeSpec {
  const hour = date.getHours();

  // Daytime, 6AM–4PM
 if (hour >= 6 && hour < 16) {
    return {
      gradient: ['#e2cbee', '#f3c48fb1'],
    };
  }

  // "Afternoon/Sunset, ..." swatch: lavender to blush
  if (hour >= 16 && hour < 20) {
    return {
      gradient: ['#fdb352', '#f6d9e6'],
    };
  }

  // "Night, 8pm–..." swatch: deep navy/indigo
  return {
    gradient: ['#40408c', '#7b7baf'],
  };
}

function TimeGradientBackground() {
  const [theme, setTheme] = useState<ThemeSpec>(() => getThemeForTime());

  React.useEffect(() => {
    const id = setInterval(() => setTheme(getThemeForTime()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

// ─── Swipeable Card ───────────────────────────────────────────────────────────


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

      onPanResponderMove: (
        _: GestureResponderEvent,
        g: PanResponderGestureState
      ) => {
        if (g.dx < 0) translateX.setValue(g.dx);
      },

      onPanResponderRelease: (
        _: GestureResponderEvent,
        g: PanResponderGestureState
      ) => {
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
        <Text style={{ color: '#fff', fontSize: rs(13), fontWeight: '700' }}>
          🗑 DELETE
        </Text>
      </Animated.View>

      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX }] }}>
        {children}
      </Animated.View>
    </View>
  );
}

// ─── Friend Request Card ──────────────────────────────────────────────────────

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
          <Pressable onPress={onAccept} style={n.acceptBtn}>
            <Text style={n.acceptTxt}>✓ ACCEPT</Text>
          </Pressable>

          <Pressable onPress={onDecline} style={n.declineBtn}>
            <Text style={n.declineTxt}>✕ DECLINE</Text>
          </Pressable>
        </View>
      </View>
    </SwipeableCard>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

function EventCard({
  item,
  onDelete,
}: {
  item: EventNotification;
  onDelete: () => void;
}) {
  const isCloseFriends = item.circle_status === 'close-friends';
  const date = new Date(item.time_of_event);

  return (
    <SwipeableCard onDelete={onDelete}>
      <View style={[n.card, !item.is_read && n.cardUnread]}>
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

          <View style={n.tag}>
            <Text style={n.tagTxt}>
              {isCloseFriends ? '🔒 INNER' : '🌍 ALL'}
            </Text>
          </View>
        </View>

        {!!item.event_des && (
          <Text style={n.cardDesc}>{item.event_des}</Text>
        )}

        <Text style={n.meta}>📅 {date.toDateString()}</Text>

        {!!item.location && (
          <Text style={n.meta}>📍 {item.location}</Text>
        )}
      </View>
    </SwipeableCard>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={n.emptyWrap}>
      <Text style={n.emptyIcon}>🔔</Text>
      <Text style={n.emptyTitle}>All caught up</Text>
      <Text style={n.emptySub}>No new notifications</Text>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NavTabId>('bell');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) return;

    try {
      setLoading(true);

      // Friend requests
      const reqRes = await fetch(
        `${getBaseUrl()}/friends/requests?user_id=${userId}`
      );
      const reqData = reqRes.ok ? await reqRes.json() : { requests: [] };

      // Event notifications
      const evtRes = await fetch(
        `${getBaseUrl()}/notifications?user_id=${userId}`
      );
      const evtData = evtRes.ok ? await evtRes.json() : [];

      const friendRequests: FriendRequest[] =
        reqData.requests?.map((r: any) => ({
          ...r,
          type: 'friend_request',
        })) ?? [];

      const eventNotifs: EventNotification[] = evtData.map((n: any) => ({
        id: n.id,                                        // ✅ notification uuid
        sidequest_id: n.sidequest_id,
        type: 'event',
        event_title: n.event_title ?? '',
        event_des: n.event_des ?? '',
        location: n.location ?? '',
        time_of_event: n.time_of_event ?? '',
        circle_status: n.circle_status ?? 'everyone',
        creator_first_name: n.creator_first_name ?? '',
        creator_last_name: n.creator_last_name ?? '',
        is_read: n.is_read ?? false,
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
    await fetch(`${getBaseUrl()}/friends/requests/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    });
    setNotifications((prev) =>
      prev.filter((n) => !(n.type === 'friend_request' && n.id === item.id))
    );
  };

  const handleDecline = async (item: FriendRequest) => {
    await fetch(`${getBaseUrl()}/friends/requests/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'declined' }),
    });
    setNotifications((prev) =>
      prev.filter((n) => !(n.type === 'friend_request' && n.id === item.id))
    );
  };

  // Marks is_deleted = true in DB, then removes from UI
  const handleDelete = async (id: string, type: NotificationItem['type']) => {
    if (type === 'event') {
      await fetch(`${getBaseUrl()}/notifications/${id}/delete`, {
        method: 'PATCH',
      }).catch(() => {});
    }
    setNotifications((prev) =>
      prev.filter((n) => !(n.id === id && n.type === type))
    );
  };

  return (
  <View style={{ flex: 1 }}>
    <TimeGradientBackground />
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top, backgroundColor: 'transparent' }}>
        <Text style={n.pageTitle}>Notifications</Text>

        {!loading && notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            contentContainerStyle={{
              paddingHorizontal: rs(16),
              paddingTop: rs(12),
              paddingBottom: rs(120),
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
        notificationCount={notifications.length}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const n = StyleSheet.create({
  pageTitle: {
    fontSize: rs(22),
    fontWeight: '800',
    color: '#111',
    paddingHorizontal: rs(16),
    paddingTop: rs(8),
    paddingBottom: rs(4),
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: rs(16),
    padding: rs(14),
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  cardUnread: {
    borderColor: '#c8d8ff',
    backgroundColor: '#f0f4ff',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    marginBottom: rs(8),
  },
  iconCircle: {
    width: rs(38),
    height: rs(38),
    borderRadius: rs(19),
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: rs(14),
    fontWeight: '700',
    color: '#111',
  },
  cardSub: {
    fontSize: rs(12),
    color: '#888',
    marginTop: rs(2),
  },
  cardDesc: {
    fontSize: rs(13),
    color: '#444',
    marginBottom: rs(6),
  },
  meta: {
    fontSize: rs(12),
    color: '#666',
    marginTop: rs(3),
  },
  tag: {
    backgroundColor: '#111',
    borderRadius: rs(6),
    paddingHorizontal: rs(7),
    paddingVertical: rs(3),
  },
  tagTxt: {
    color: '#fff',
    fontSize: rs(10),
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: rs(8),
    marginTop: rs(4),
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: rs(10),
    paddingVertical: rs(9),
    alignItems: 'center',
  },
  acceptTxt: {
    color: '#fff',
    fontSize: rs(13),
    fontWeight: '700',
  },
  declineBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: rs(10),
    paddingVertical: rs(9),
    alignItems: 'center',
  },
  declineTxt: {
    color: '#111',
    fontSize: rs(13),
    fontWeight: '700',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: rs(8),
  },
  emptyIcon: {
    fontSize: rs(48),
  },
  emptyTitle: {
    fontSize: rs(18),
    fontWeight: '800',
    color: '#111',
  },
  emptySub: {
    fontSize: rs(14),
    color: '#888',
  },
});