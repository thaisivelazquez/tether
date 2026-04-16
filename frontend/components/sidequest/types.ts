export type RingLevel = 'close-friends' | 'friends';



export type Notification = {
  id: string;
  type: 'new_sidequest' | 'join' | 'co_join' | 'reminder' | 'heading_out';
  sidequest: Sidequest;
  triggeredBy: User[];
  read: boolean;
  timestamp: string;
};

// components/sidequest/types.ts

export type User = {
  id: string;
  name: string;
  handle: string;
  avatar: string | null;
  ringLevel: number;
};

export type Sidequest = {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string | null;
  location: string;
  maxAttendees: number;
  circleStatus: 'everyone' | 'close-friends'; // ✅ camelCase
  attendees: string[];
  postedBy: User;
};
