import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as mock from '../constants/mockData';
import type { Notification, RingLevel, Sidequest, User } from '../types';

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

type AppContextValue = {
  users: User[];
  sidequests: Sidequest[];
  notifications: Notification[];
  currentUser: User;
  currentUserId: string;
  isFirstTime: boolean;
  setIsFirstTime: (v: boolean) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  setCurrentUserId: (id: string) => void;
  joinSidequest: (sidequestId: string) => void;
  leaveSidequest: (sidequestId: string) => void;
  cancelSidequest: (sidequestId: string) => void;
  addSidequest: (s: Omit<Sidequest, 'id' | 'createdAt' | 'attendees' | 'postedBy'> & { postedById?: string }) => void;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  updateSidequest: (id: string, patch: Partial<Sidequest>) => void;
  setUserRingLevel: (userId: string, ring: RingLevel) => void;
  /** Friends shown on Circle (plan: circle diagram). */
  circleMemberIds: string[];
  removeFromCircle: (userId: string) => void;
  addFriendByPhone: (phone: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => clone(mock.usersSeed));
  const [sidequests, setSidequests] = useState<Sidequest[]>(() => clone(mock.sidequestsSeed));
  const [notifications, setNotifications] = useState<Notification[]>(() => clone(mock.notificationsSeed));
  const [currentUserId, setCurrentUserId] = useState(mock.currentUserId);
  const [isFirstTime, setIsFirstTime] = useState(mock.isFirstTime);
  const [circleMemberIds, setCircleMemberIds] = useState<string[]>(() =>
    mock.usersSeed.filter((u) => u.id !== mock.currentUserId).map((u) => u.id),
  );

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId)!,
    [users, currentUserId],
  );

  const updateUser = useCallback((id: string, patch: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const setUserRingLevel = useCallback((userId: string, ring: RingLevel) => {
    updateUser(userId, { ringLevel: ring });
  }, [updateUser]);

  const updateSidequest = useCallback((id: string, patch: Partial<Sidequest>) => {
    setSidequests((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const joinSidequest = useCallback(
    (sidequestId: string) => {
      const me = users.find((u) => u.id === currentUserId);
      if (!me) return;
      setSidequests((prev) =>
        prev.map((s) => {
          if (s.id !== sidequestId) return s;
          if (s.attendees.some((a) => a.id === me.id)) return s;
          if (s.attendees.length >= s.maxAttendees) return s;
          return { ...s, attendees: [...s.attendees, me] };
        }),
      );
    },
    [currentUserId, users],
  );

  const leaveSidequest = useCallback(
    (sidequestId: string) => {
      setSidequests((prev) =>
        prev.map((s) =>
          s.id === sidequestId
            ? { ...s, attendees: s.attendees.filter((a) => a.id !== currentUserId) }
            : s,
        ),
      );
    },
    [currentUserId],
  );

  const cancelSidequest = useCallback((sidequestId: string) => {
    setSidequests((prev) => prev.filter((s) => s.id !== sidequestId));
    setNotifications((prev) => prev.filter((n) => n.sidequest.id !== sidequestId));
  }, []);

  const removeFromCircle = useCallback((userId: string) => {
    setCircleMemberIds((prev) => prev.filter((id) => id !== userId));
  }, []);

  const addFriendByPhone = useCallback(
    (phone: string) => {
      if (!phone.trim()) return;
      const id = `u_${Date.now()}`;
      const newbie: User = {
        id,
        name: 'New Friend',
        handle: '@newfriend',
        avatar: '🙂',
        location: 'NYC',
        status: 'Just joined your circle.',
        ringLevel: 'friends',
      };
      setUsers((prev) => [...prev, newbie]);
      setCircleMemberIds((prev) => [...prev, id]);
    },
    [],
  );

  const addSidequest = useCallback(
    (
      input: Omit<Sidequest, 'id' | 'createdAt' | 'attendees' | 'postedBy'> & { postedById?: string },
    ) => {
      const id = `sq_${Date.now()}`;
      const postedBy = users.find((u) => u.id === (input.postedById ?? currentUserId)) ?? currentUser;
      const { postedById: _p, ...rest } = input;
      const next: Sidequest = {
        ...rest,
        id,
        postedBy,
        attendees: [],
        createdAt: new Date().toISOString(),
      };
      setSidequests((prev) => [next, ...prev]);
    },
    [currentUser, currentUserId, users],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      users,
      sidequests,
      notifications,
      currentUser,
      currentUserId,
      isFirstTime,
      setIsFirstTime,
      updateUser,
      setCurrentUserId,
      joinSidequest,
      leaveSidequest,
      cancelSidequest,
      addSidequest,
      setNotifications,
      updateSidequest,
      setUserRingLevel,
      circleMemberIds,
      removeFromCircle,
      addFriendByPhone,
    }),
    [
      users,
      sidequests,
      notifications,
      currentUser,
      currentUserId,
      isFirstTime,
      updateUser,
      joinSidequest,
      leaveSidequest,
      cancelSidequest,
      addSidequest,
      setUserRingLevel,
      circleMemberIds,
      removeFromCircle,
      addFriendByPhone,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
