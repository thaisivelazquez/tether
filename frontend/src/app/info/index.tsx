import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../../../components/info/infostyles';

export default function Slide4() {
  const router = useRouter();
  const whiteOverlay = useRef(new Animated.Value(1)).current;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [location, setLocation] = useState('');
  const [affiliation, setAffiliation] = useState('');

  // Fade white overlay out on mount (reveal screen)
  useEffect(() => {
    Animated.timing(whiteOverlay, {
      toValue: 0,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    birthday.trim() !== '' &&
    location.trim() !== '';

  const handleBirthdayChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    setBirthday(formatted.slice(0, 5));
  };

  const handleSubmit = () => {
    if (!isFormValid) {
      alert('Please fill out all required fields.');
      return;
    }
    // Fade white overlay in before navigating
    Animated.timing(whiteOverlay, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      router.push('/welcome');
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

        <View style={styles.slide}>
          <View style={styles.formBlock}>
            <Text style={styles.formHeadline}>
              one last thing—{'\n'}tell us about yourself.
            </Text>

            {/* First + Last Name */}
            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FIRST NAME *</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputText}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    placeholder="First Name"
                    placeholderTextColor="#999"
                    underlineColorAndroid="transparent"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>LAST NAME *</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputText}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    placeholder="Last Name"
                    placeholderTextColor="#999"
                    underlineColorAndroid="transparent"
                    returnKeyType="next"
                  />
                </View>
              </View>
            </View>

            {/* Birthday */}
            <View style={styles.fullWidthGroup}>
              <Text style={styles.inputLabel}>BIRTHDAY *</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.inputText}
                  value={birthday}
                  onChangeText={handleBirthdayChange}
                  placeholder="DD/MM"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={5}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.fullWidthGroup}>
              <Text style={styles.inputLabel}>LOCATION *</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.inputText}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="City, Country"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            {/* Affiliation */}
            <View style={styles.fullWidthGroup}>
              <Text style={styles.inputLabel}>AFFILIATION</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.inputText}
                  value={affiliation}
                  onChangeText={setAffiliation}
                  placeholder="School, Company, etc."
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            {/* Complete Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.completeBtn,
                { opacity: isFormValid ? 1 : 0.4 },
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid}
            >
              <Text style={styles.completeBtnText}>
                Complete sign up →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* White overlay on top of everything */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          opacity: whiteOverlay,
        }}
      />
    </View>
  );
}