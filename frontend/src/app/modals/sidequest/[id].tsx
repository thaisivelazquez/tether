import { Pressable, StyleSheet, Text, View } from 'react-native';

type User = {
  name: string;
};

type Props = {
  user: User;
  startTime: string;
  endTime: string;
  onPress: () => void;
};

function formatTimeRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);

  const format = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `${format(s)} - ${format(e)}`;
}

function minutesAgo(dateString: string) {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diff = Math.floor((now - past) / 60000);

  if (diff < 1) return 'just now';
  if (diff === 1) return '1 min ago';
  return `${diff} min ago`;
}

export default function ExampleCard({ user, startTime, endTime, onPress }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{user.name}</Text>

      <Text style={styles.time}>{formatTimeRange(startTime, endTime)}</Text>

      <Text style={styles.meta}>{minutesAgo(startTime)}</Text>

      <Pressable onPress={onPress} style={styles.button}>
        <Text style={styles.buttonText}>Join</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1c1c1e',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  time: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});