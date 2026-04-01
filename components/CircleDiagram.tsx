import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { tokens } from '../constants/theme';
import type { RingLevel, User } from '../types';

import { UserAvatar } from './UserAvatar';

const R_INNER = 72;
const R_OUTER = 118;
const AV = 40;

type Props = {
  currentUser: User;
  members: User[];
  mode: 'view' | 'edit';
  size?: number;
  onRingChange?: (userId: string, ring: RingLevel) => void;
  onRemove?: (userId: string) => void;
};

function placeOnRing(
  index: number,
  count: number,
  radius: number,
  cx: number,
  cy: number,
) {
  if (count === 0) return { x: cx, y: cy };
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle) - AV / 2,
    y: cy + radius * Math.sin(angle) - AV / 2,
  };
}

function AvatarNode({
  user,
  left,
  top,
  editable,
  onRingChange,
  onRemove,
}: {
  user: User;
  left: number;
  top: number;
  editable: boolean;
  onRingChange?: (userId: string, ring: RingLevel) => void;
  onRemove?: (userId: string) => void;
}) {
  const face = <UserAvatar label={user.avatar} size={AV} />;

  if (!editable) {
    return <View style={[styles.abs, { left, top }]}>{face}</View>;
  }

  return (
    <Pressable
      style={[styles.abs, { left, top }]}
      onPress={() => {
        const next: RingLevel =
          user.ringLevel === 'close-friends' ? 'friends' : 'close-friends';
        onRingChange?.(user.id, next);
      }}
      onLongPress={() => onRemove?.(user.id)}
      delayLongPress={500}
    >
      {face}
    </Pressable>
  );
}

export function CircleDiagram({
  currentUser: _currentUser,
  members,
  mode,
  size = 300,
  onRingChange,
  onRemove,
}: Props) {
  void _currentUser;
  const cx = size / 2;
  const cy = size / 2;
  const editable = mode === 'edit';

  const { inner, outer } = useMemo(() => {
    const inner = members.filter((m) => m.ringLevel === 'close-friends');
    const outer = members.filter((m) => m.ringLevel === 'friends');
    return { inner, outer };
  }, [members]);

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <View
        style={[
          styles.ring,
          {
            width: R_OUTER * 2,
            height: R_OUTER * 2,
            borderRadius: R_OUTER,
            left: cx - R_OUTER,
            top: cy - R_OUTER,
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          styles.innerRing,
          {
            width: R_INNER * 2,
            height: R_INNER * 2,
            borderRadius: R_INNER,
            left: cx - R_INNER,
            top: cy - R_INNER,
          },
        ]}
      />
      <View style={[styles.center, { left: cx - 10, top: cy - 10 }]}>
        <View style={styles.centerDot} />
      </View>
      {inner.map((u, i) => {
        const p = placeOnRing(i, inner.length, R_INNER, cx, cy);
        return (
          <AvatarNode
            key={u.id}
            user={u}
            left={p.x}
            top={p.y}
            editable={editable}
            onRingChange={onRingChange}
            onRemove={onRemove}
          />
        );
      })}
      {outer.map((u, i) => {
        const p = placeOnRing(i, outer.length, R_OUTER, cx, cy);
        return (
          <AvatarNode
            key={u.id}
            user={u}
            left={p.x}
            top={p.y}
            editable={editable}
            onRingChange={onRingChange}
            onRemove={onRemove}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: tokens.border,
    backgroundColor: 'transparent',
  },
  innerRing: {
    borderStyle: 'dashed',
  },
  center: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: tokens.text,
  },
  abs: {
    position: 'absolute',
    width: AV,
    height: AV,
  },
});
