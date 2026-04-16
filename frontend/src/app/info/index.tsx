import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../../components/info/infostyles";

export default function InfoPage() {
  const router = useRouter();
  const whiteOverlay = useRef(new Animated.Value(1)).current;

  const [userId, setUserId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState(""); // YYYY-MM-DD
  const [location, setLocation] = useState("");
  const [affiliation, setAffiliation] = useState("");

  // Fade white overlay out on mount
  useEffect(() => {
    Animated.timing(whiteOverlay, {
      toValue: 0,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  // Get phone from previous page (AsyncStorage) and fetch userId
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const storedPhone = await AsyncStorage.getItem("phone"); // stored from previous page
  //       if (!storedPhone) {
  //         Alert.alert(
  //           "User not found",
  //           "Phone number missing. Please restart signup."
  //         );
  //         return;
  //       }

  //       setPhone(storedPhone);

  //       const res = await fetch(
  //         `http://YOUR_IP:3000/users/by-phone/${encodeURIComponent(
  //           storedPhone
  //         )}`
  //       );
  //       if (!res.ok) throw new Error("User not found");

  //       const data = await res.json();
  //       setUserId(data.user.id);

  //       // Optionally pre-fill existing info
  //       setFirstName(data.user.first_name || "");
  //       setLastName(data.user.last_name || "");
  //       setBirthday(data.user.birthdate || ""); // YYYY-MM-DD
  //       setLocation(data.user.location || "");
  //       setAffiliation(data.user.affiliation || "");
  //     } catch (err) {
  //       console.error(err);
  //       Alert.alert(
  //         "User not found",
  //         "Please restart signup."
  //       );
  //     }
  //   };

  //   fetchUser();
  // }, []);

  
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Use SecureStore since that's where we saved it in the verify step!
        //const id = await SecureStore.getItemAsync("user_id");
        const id = await AsyncStorage.getItem("user_id");
        console.log("Fetched from SecureStore:", id);
        
        if (id) {
          setUserId(id);
          // Now fetch the rest of the profile if you want to pre-fill
          const res = await fetch(`http:///users/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFirstName(data.user.first_name || "");
            // ... rest of your setters
          }
        }
      } catch (err) {
        console.error("Failed to load user ID", err);
      }
    };
    loadUser();
  }, []);

  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    birthday.trim() !== "" &&
    location.trim() !== "";

  const handleBirthdayChange = (text: string) => {
    // Accept only digits and dashes for YYYY-MM-DD
    const cleaned = text.replace(/[^0-9-]/g, "");
    setBirthday(cleaned.slice(0, 10)); // max 10 chars
  };

  const handleSubmit = async () => {
    console.log("📂 Current stored user_id:", userId);
    if (!isFormValid || !userId) {
      
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch(`http:///users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          birthdate: birthday,
          location,
          affiliation,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      Animated.timing(whiteOverlay, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        router.push("/homepage");
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />
        <View style={styles.slide}>
          <View style={styles.formBlock}>
            <Text style={styles.formHeadline}>
              one last thing—{"\n"}tell us about yourself.
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
              <Text style={styles.inputLabel}>BIRTHDAY (YYYY-MM-DD) *</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.inputText}
                  value={birthday}
                  onChangeText={handleBirthdayChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
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
              // disabled={!isFormValid || !userId}
            >
              <Text style={styles.completeBtnText}>
                Complete sign up →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* White overlay */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#FFFFFF",
          opacity: whiteOverlay,
        }}
      />
    </View>
  );
}

