import type { Notification, Sidequest, User } from '../types';

/** Columbia-area + casual tone (plan Section 7). */
export const MOCK_UNIVERSITIES = [
  'Columbia University',
  'Barnard College',
  'NYU',
  'The New School',
  'Fordham University',
] as const;

export const isFirstTime = true;

const iso = (d: Date) => d.toISOString();

const today = new Date();
today.setHours(12, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const inTwoDays = new Date(today);
inTwoDays.setDate(inTwoDays.getDate() + 2);
const inFourDays = new Date(today);
inFourDays.setDate(inFourDays.getDate() + 4);

const atHour = (day: Date, h: number, m = 0) => {
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d;
};

export const usersSeed: User[] = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    handle: '@alex',
    avatar: '🙂',
    location: 'Morningside Heights',
    birthday: '12/03',
    status: 'Coffee first, plans later.',
    ringLevel: 'close-friends',
  },
  {
    id: 'u2',
    name: 'Jordan Kim',
    handle: '@jkim',
    avatar: '🙂',
    location: 'Upper West Side',
    birthday: '22/07',
    status: 'Always down for a walk.',
    ringLevel: 'friends',
  },
  {
    id: 'u3',
    name: 'Sam Okonkwo',
    handle: '@sam_o',
    avatar: '🙂',
    location: 'Harlem',
    birthday: '05/11',
    status: 'Studying at Butler until further notice.',
    ringLevel: 'close-friends',
  },
  {
    id: 'u4',
    name: 'Riley Chen',
    handle: '@rileyc',
    avatar: '🙂',
    location: 'Astoria',
    birthday: '18/01',
    status: "Weekend farmer's market regular.",
    ringLevel: 'friends',
  },
  {
    id: 'u5',
    name: 'Morgan Patel',
    handle: '@morganp',
    avatar: '🙂',
    location: 'Brooklyn Heights',
    birthday: '30/09',
    status: 'Riverside runs > gym.',
    ringLevel: 'friends',
  },
];

const u = (id: string) => usersSeed.find((x) => x.id === id)!;

export const sidequestsSeed: Sidequest[] = [
  {
    id: 'sq1',
    title: 'Low-key study block at Butler',
    description: 'Quiet tables on 3rd floor — headphones on, snacks welcome.',
    postedBy: u('u2'),
    startTime: iso(atHour(today, 14)),
    endTime: iso(atHour(today, 17)),
    location: 'Butler Library, Columbia University',
    maxAttendees: 6,
    attendees: [u('u3'), u('u1')],
    visibility: 'everyone',
    createdAt: iso(new Date(today.getTime() - 45 * 60 * 1000)),
  },
  {
    id: 'sq2',
    title: 'Sunset picnic at Riverside Park',
    description: 'Bringing a blanket + grapes. BYO whatever feels easy.',
    postedBy: u('u3'),
    startTime: iso(atHour(tomorrow, 18)),
    endTime: iso(atHour(tomorrow, 20)),
    location: 'Riverside Park (near 116th)',
    maxAttendees: 8,
    attendees: [u('u1')],
    visibility: 'close-friends',
    createdAt: iso(new Date(today.getTime() - 3 * 60 * 60 * 1000)),
  },
  {
    id: 'sq3',
    title: 'Morning coffee on Broadway',
    description: 'Quick catch-up before class — 20 minutes max.',
    postedBy: u('u1'),
    startTime: iso(atHour(tomorrow, 9)),
    endTime: iso(atHour(tomorrow, 9, 40)),
    location: 'Blue Bottle, 120th & Broadway',
    maxAttendees: 3,
    attendees: [u('u2')],
    visibility: 'close-friends',
    createdAt: iso(new Date(today.getTime() - 20 * 60 * 1000)),
  },
  {
    id: 'sq4',
    title: 'Walk & talk: Morningside Park loop',
    description: 'Easy pace, no route optimization — just show up.',
    postedBy: u('u4'),
    startTime: iso(atHour(inTwoDays, 17)),
    endTime: iso(atHour(inTwoDays, 18)),
    location: 'Morningside Park entrance @ 110th',
    maxAttendees: 10,
    attendees: [u('u5'), u('u2'), u('u1')],
    visibility: 'everyone',
    createdAt: iso(new Date(today.getTime() - 6 * 60 * 60 * 1000)),
  },
  {
    id: 'sq5',
    title: 'Late-night dumplings on Amsterdam',
    description: 'Ordering a bunch of plates to share — come hungry.',
    postedBy: u('u5'),
    startTime: iso(atHour(tomorrow, 21)),
    endTime: iso(atHour(tomorrow, 22, 30)),
    location: 'Amsterdam Ave (near 109th)',
    maxAttendees: 5,
    attendees: [],
    visibility: 'everyone',
    createdAt: iso(new Date(today.getTime() - 90 * 60 * 1000)),
  },
  {
    id: 'sq6',
    title: 'Reading room co-work (no talking)',
    description: 'Silent vibes only — perfect for finals crunch.',
    postedBy: u('u2'),
    startTime: iso(atHour(inFourDays, 13)),
    endTime: iso(atHour(inFourDays, 18)),
    location: 'Butler Library, Room 301',
    maxAttendees: 4,
    attendees: [u('u1')],
    visibility: 'close-friends',
    createdAt: iso(new Date(today.getTime() - 12 * 60 * 60 * 1000)),
  },
  {
    id: 'sq7',
    title: 'Impromptu frisbee at the Great Lawn',
    description: 'If it’s crowded we’ll migrate — texting updates in-thread.',
    postedBy: u('u3'),
    startTime: iso(atHour(inTwoDays, 15)),
    endTime: iso(atHour(inTwoDays, 17)),
    location: 'Central Park — Great Lawn',
    maxAttendees: 12,
    attendees: [u('u4')],
    visibility: 'everyone',
    createdAt: iso(new Date(today.getTime() - 4 * 60 * 60 * 1000)),
  },
  {
    id: 'sq8',
    title: 'Thrift + boba errand run',
    description: 'Hitting 2–3 spots — bail anytime, no pressure.',
    postedBy: u('u1'),
    startTime: iso(atHour(inFourDays, 11)),
    endTime: iso(atHour(inFourDays, 15)),
    location: 'Flushing / downtown route (TBD in chat)',
    maxAttendees: 4,
    attendees: [u('u5')],
    visibility: 'close-friends',
    createdAt: iso(new Date(today.getTime() - 8 * 60 * 60 * 1000)),
  },
];

const sq = (id: string) => sidequestsSeed.find((x) => x.id === id)!;

export const notificationsSeed: Notification[] = [
  {
    id: 'n1',
    type: 'new_sidequest',
    sidequest: sq('sq5'),
    triggeredBy: [u('u5')],
    read: false,
    timestamp: iso(new Date(today.getTime() - 10 * 60 * 1000)),
  },
  {
    id: 'n2',
    type: 'join',
    sidequest: sq('sq1'),
    triggeredBy: [u('u3')],
    read: false,
    timestamp: iso(new Date(today.getTime() - 25 * 60 * 1000)),
  },
  {
    id: 'n3',
    type: 'co_join',
    sidequest: sq('sq4'),
    triggeredBy: [u('u2')],
    read: true,
    timestamp: iso(new Date(today.getTime() - 2 * 60 * 60 * 1000)),
  },
  {
    id: 'n4',
    type: 'reminder',
    sidequest: sq('sq2'),
    triggeredBy: [u('u3'), u('u1')],
    read: false,
    timestamp: iso(new Date(today.getTime() - 50 * 60 * 1000)),
  },
  {
    id: 'n5',
    type: 'heading_out',
    sidequest: sq('sq3'),
    triggeredBy: [u('u1')],
    read: true,
    timestamp: iso(new Date(today.getTime() - 5 * 60 * 60 * 1000)),
  },
  {
    id: 'n6',
    type: 'new_sidequest',
    sidequest: sq('sq7'),
    triggeredBy: [u('u3')],
    read: false,
    timestamp: iso(new Date(today.getTime() - 70 * 60 * 1000)),
  },
];

export const currentUserId = 'u1';

export const tickerPhrases = [
  'Thai takeout on the stoop tonight?',
  'Anyone free for a sunset walk?',
  'Coworking at Butler — headphones on.',
  'Impromptu boba run in 20?',
  'Farmers market Saturday AM?',
];
