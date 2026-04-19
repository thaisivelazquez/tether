import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Clipboard from 'expo-clipboard';


import { Navbar, NavTabId } from '../../../components/navbar/navbar';
import CreateSidequestForm from '../modals/sidequest/create';

const EditButtonImg = require('../../../components/myprofile/editbutton.png');
const PfpImg = require('../../../components/myprofile/pfp.png');

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const DISMISS_THRESHOLD = 120;

// ✅ Fixed getBaseUrl
const getBaseUrl = () => {
  // Check if we are in production mode (Publish/Build)
  if (!__DEV__) {
    return 'https://tether-production-c60a.up.railway.app';
  }

  // Otherwise, use local settings for your current dev work
  return Platform.OS === 'web' 
    ? 'http://localhost:3000' 
    : 'http://172.19.1.168:3000'; // Your current local IP
};

type Sidequest = {
  id: string;
  title: string;
  location: string;
  maxAttendees: number;
  attendees: any[];
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<NavTabId>('profile');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidequests, setSidequests] = useState<Sidequest[]>([]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [birthday, setBirthday] = useState('');
  const [bio, setBio] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const id = await AsyncStorage.getItem('user_id');
          if (!id) return;
          // ✅ Fixed URL
          const res = await fetch(`${getBaseUrl()}/users/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFirstName(data.user.first_name || '');
            setLastName(data.user.last_name || '');
            setStatus(data.user.status || '');
            setLocation(data.user.location || '');
            setBirthday(data.user.birthdate || '');
            setBio(data.user.bio || '');
          }
        } catch (err) {
          console.error('Load error:', err);
        }
      };
      loadUser();
    }, [])
  );

  const formatBirthday = (dateString: string | null) => {
    if (!dateString) return 'Add birthday';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  const data = useMemo(() => {
    return [...sidequests].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  }, [sidequests]);
  const handleLogout = async () => {
  try {
    await AsyncStorage.multiRemove(['user_id', 'token']);
    router.replace('/login'); // change this if your login route is different
  } catch (error) {
    console.error('Logout error:', error);
    Alert.alert('Error', 'Could not log out. Please try again.');
  }
};

  return (
    
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
        
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* Top Bar */}
          
          <View style={styles.topBar}>
  <Pressable
    onPress={() => router.push('/myprofile/edit')}
    style={styles.editIconWrap}
  >
    <Image
      source={EditButtonImg}
      style={{ width: 22, height: 22 }}
      resizeMode="contain"
    />
  </Pressable>

  <Pressable
    
    onPress={() =>
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: handleLogout },
      ])
    }
  >
    <Text>LOG OUT</Text>
  </Pressable>
</View>

          {/* Profile */}
          <View style={styles.hero}>
            <Image
              source={PfpImg}
              style={{ width: 136, height: 136 }}
              resizeMode="contain"
            />

            <Text style={styles.name}>
              {firstName} {lastName}
            </Text>

            <Text style={styles.infoText}>
              {bio}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>📍 {location || 'Add location'}</Text>
              <Text style={styles.infoText}>
                🎂 {formatBirthday(birthday)}
              </Text>
            </View>

           <Pressable
  style={styles.shareBtn}
  onPress={async () => {
    const id = await AsyncStorage.getItem('user_id');
    const link = `exp://172.19.8.233:8081/--/profile/${id}`;

    try {
      await Share.share({
        message: `Check out my Tether profile! ${link}`,
      });
    } catch (err) {
      await Clipboard.setStringAsync(link);
      Alert.alert('Copied!', 'Profile link copied to clipboard.');
    }
  }}
>
  
  <Text style={styles.shareBtnText}>SHARE PROFILE</Text>
</Pressable>
          </View>
          
          {/* Sidequests */}
          <View style={styles.section}>
            <Text style={styles.bigSectionTitle}>
              You are making things happen...
            </Text>

            <View style={styles.cardsWrap}>
              {data.map((item) => (
                <View key={item.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>
                    📍 {item.location}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
        </ScrollView>

      </SafeAreaView>
    

      <AddSidequestSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddPress={() => setSheetOpen(true)}
      />
    </View>
  );
}

function AddSidequestSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 1.5) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 250,
            useNativeDriver: true,
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

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable style={localStyles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          localStyles.sheetContainer,
          { transform: [{ translateY }] },
        ]}
      >
        <View {...panResponder.panHandlers} style={localStyles.handleArea}>
          <View style={localStyles.handle} />
        </View>
        <CreateSidequestForm onClose={onClose} />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ececec',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 18,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10,
  },
  status: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 18,
  },
  infoText: {
    fontSize: 11.5,
    color: '#666',
  },
  shareBtn: {
    borderWidth: 1,
    marginTop: 10,
    padding: 8,
  },
  shareBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    marginTop: 26,
    paddingHorizontal: 16,
  },
  bigSectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 14,
  },
  cardsWrap: { gap: 12 },
  card: {
    backgroundColor: '#f7f4ef',
    borderRadius: 14,
    padding: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 12,
    color: '#666',
  },
  
});

const localStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleArea: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
  }

});