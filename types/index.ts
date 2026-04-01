export type RingLevel = 'close-friends' | 'friends';

export type User = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  location?: string;
  birthday?: string;
  status?: string;
  ringLevel: RingLevel;
};

export type Sidequest = {
  id: string;
  title: string;
  description: string;
  postedBy: User;
  startTime: string; // ISO string
  endTime: string; // ISO string
  location: string;
  maxAttendees: number;
  attendees: User[];
  visibility: 'everyone' | 'close-friends';
  createdAt: string;
};

export type Notification = {
  id: string;
  type: 'new_sidequest' | 'join' | 'co_join' | 'reminder' | 'heading_out';
  sidequest: Sidequest;
  triggeredBy: User[];
  read: boolean;
  timestamp: string;
};
