import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../../../components/info/infostyles';

export default function Slide4() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [location, setLocation] = useState('');
  const [affiliation, setAffiliation] = useState('');

  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    birthday.trim() !== '' &&
    location.trim() !== '';

  // Auto-format birthday as DD/MM
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
    console.log('Form submitted');
  };

  return (
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
  );
}