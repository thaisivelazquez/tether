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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />
      <View style={styles.slide}>
        <View style={styles.formBlock}>
          <Text style={styles.formHeadline}>
            one last thing—{'\n'}tell us about yourself.
          </Text>

          <View style={styles.formRow}>
            <View style={[styles.inputWrap, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>FIRST NAME</Text>
              <TextInput
                style={[styles.input, styles.inputActive]}
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#ccc"
              />
            </View>
            <View style={[styles.inputWrap, { flex: 1 }]}>
              <Text style={styles.inputLabel}>LAST NAME</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="#ccc"
              />
            </View>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>BIRTHDAY</Text>
            <TextInput
              style={styles.input}
              value={birthday}
              onChangeText={setBirthday}
              placeholder="DD/MM"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>LOCATION</Text>
            <View style={styles.selectBox}>
              <Text style={styles.selectPlaceholder}>{location || ''}</Text>
              <Text style={styles.selectChevron}>⌄</Text>
            </View>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>AFFILIATION</Text>
            <View style={styles.selectBox}>
              <Text style={styles.selectPlaceholder}>{affiliation || ''}</Text>
              <Text style={styles.selectChevron}>⌄</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.completeBtn}>
            <Text style={styles.completeBtnText}>Complete sign up  →</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}