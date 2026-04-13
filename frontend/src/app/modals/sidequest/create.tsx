import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert, Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateSidequestForm({ onClose }: { onClose: () => void }) {

  const router = useRouter();
  const insets = useSafeAreaInsets();

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

const submit = async () => {
  // 1. Get the userId we stored earlier
  const userId = await AsyncStorage.getItem("user_id");
  console.log("🚀 Payload User ID:", userId);


  if (!userId) {
    Alert.alert("Error", "User session not found. Please log in again.");
    return;
  }

  // 2. Setup your dates (Logic you already had)
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(15, 0, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  try {
    // 3. Make the API call
    const res = await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        event_title: title.trim() || 'share what you are up to',
        event_des: detail.trim() || 'Tell your friends what to expect.',
        time_of_event: start.toISOString(),
        time_event_end: end.toISOString(),
        location: location.trim() || 'Columbia University area',
        max_attendees: Math.max(1, parseInt(maxAtt, 10) || 1),
        circle_status: vis, // Mapping 'vis' state to 'circle_status' column
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to create sidequest");
    }

    // 4. Success!
    console.log("✅ Sidequest created successfully");
    onClose();
    
  } catch (err) {
    console.error("❌ Error creating sidequest:", err);
    Alert.alert("Error", "Could not save your sidequest. Try again.");
  }
};

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: '#111' }]}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 16,
      }}
    >
      {/* Drag handle */}
      <View style={styles.handle} />
      <Pressable
        onPress={submit}
        style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75 }]}
      >
        <Text style={styles.btnText}>share →</Text>
      </Pressable>

      {/* <Text style={styles.dragLabel}>CREATE SIDEQUEST</Text> */}

      <TextInput
        style={styles.bigInput}
        placeholder="share what you're up to..."
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.lab}>FROM</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.pill}
          placeholder="date"
          placeholderTextColor="#666"
          value={fromDate}
          onChangeText={setFromDate}
        />
        <TextInput
          style={styles.pill}
          placeholder="time"
          placeholderTextColor="#666"
          value={fromTime}
          onChangeText={setFromTime}
        />
      </View>

      <Text style={styles.lab}>TO</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.pill}
          placeholder="date"
          placeholderTextColor="#666"
          value={toDate}
          onChangeText={setToDate}
        />
        <TextInput
          style={styles.pill}
          placeholder="time"
          placeholderTextColor="#666"
          value={toTime}
          onChangeText={setToTime}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="📍 location"
        placeholderTextColor="#666"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="TELL YOUR FRIENDS WHAT TO EXPECT..."
        placeholderTextColor="#666"
        value={detail}
        onChangeText={setDetail}
        multiline
      />

      <Text style={styles.lab}>MAX ATTENDEES</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        placeholderTextColor="#666"
        value={maxAtt}
        onChangeText={setMaxAtt}
      />

      <Text style={styles.lab}>VISIBILITY</Text>
      <Pressable style={styles.input} onPress={() => setOpenVis((v) => !v)}>
        <Text style={{ color: '#fff' }}>
          {vis === 'everyone' ? 'Everyone' : 'Close Friends'}
        </Text>
      </Pressable>
      {openVis && (
        <View style={styles.dropdown}>
          <Pressable
            onPress={() => { setVis('close-friends'); setOpenVis(false); }}
            style={styles.opt}
          >
            <Text style={styles.optText}>Close Friends</Text>
          </Pressable>
          <Pressable
            onPress={() => { setVis('everyone'); setOpenVis(false); }}
            style={styles.opt}
          >
            <Text style={styles.optText}>Everyone</Text>
          </Pressable>
        </View>
      )}

      {/* Submit button */}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
  dragLabel: {
    textAlign: 'center',
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 16,
  },
  bigInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  lab: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 999,
    padding: 10,
    color: '#fff',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  opt: {
    paddingVertical: 10,
  },
  optText: {
    color: '#fff',
    fontSize: 14,
  },
 btn: {
    backgroundColor: '#ff004c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24, // Increased margin
    borderWidth: 2,
    borderColor: 'yellow', // THIS WILL HELP YOU LOCATE IT
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});