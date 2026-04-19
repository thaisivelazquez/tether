import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { moderateScale, scale, styles } from "../../../components/login/loginstyle";

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
const ACTIVITIES = [
  "studying at butler library till nine",
  "wine and whatever on my rooftop!",
  "running @ riverside in 30, COME",
  "reel scrolling time",
  "sledding after the blizzard 3pm ish?",
];

const COUNTRY_CODES = [
  { flag: "🇺🇸", code: "+1", label: "United States" },
  { flag: "🇬🇧", code: "+44", label: "United Kingdom" },
  { flag: "🇨🇦", code: "+1", label: "Canada" },
  { flag: "🇦🇺", code: "+61", label: "Australia" },
];

const ITEM_HEIGHT = scale(22);
const COUNT = ACTIVITIES.length;
const VISIBLE = 3;
const LOOPED = [...ACTIVITIES, ...ACTIVITIES, ...ACTIVITIES];

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(COUNT);
  const [loading, setLoading] = useState(false);
  const { height } = useWindowDimensions();

  const scrollY = useRef(
    new Animated.Value(-(COUNT * ITEM_HEIGHT) + ITEM_HEIGHT)
  ).current;
  const currentIndex = useRef<number>(COUNT);

  const isValidPhone = (num: string) => {
    const digits = num.replace(/\D/g, "");
    return digits.length >= 7;
  };

  const isValidEmail = (em: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.trim());
  };

  const isFormValid = isValidPhone(phone) && isValidEmail(email);

const handleSubmit = async () => {
  if (!isValidPhone(phone)) {
    setError("Please enter a valid phone number.");
    return;
  }
  if (!isValidEmail(email)) {
    setError("Please enter a valid email address.");
    return;
  }

  setError("");
  setLoading(true);

  try {
    const fullPhone = `${selectedCountry.code}${phone.replace(/\D/g, "")}`;

    const res = await fetch(`${getBaseUrl()}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        phone: fullPhone,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to send code.");
      setLoading(false);
      return;
    }

    router.push({
      pathname: "/verify",
      params: {
        email: email.trim().toLowerCase(),
        phone: fullPhone,
        countryCode: selectedCountry.code,
      },
    });
  } catch (err) {
    setError("Could not reach server. Is it running?");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const interval = setInterval(() => {
      const next = currentIndex.current + 1;
      currentIndex.current = next;

      Animated.timing(scrollY, {
        toValue: -(next * ITEM_HEIGHT) + ITEM_HEIGHT,
        duration: 500,
        useNativeDriver: false,
      }).start(() => {
        if (currentIndex.current >= COUNT * 2) {
          currentIndex.current = COUNT;
          scrollY.setValue(-(COUNT * ITEM_HEIGHT) + ITEM_HEIGHT);
        }
        setActiveIndex(currentIndex.current);
      });

      setActiveIndex(next);
    }, 2000);

    return () => clearInterval(interval);
  }, [scrollY]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={styles.root}>
      {/* Decorations */}
      <View style={[styles.decoWrap, { pointerEvents: "none" }]}>
        <View style={styles.decoOuter}>
          <Svg width={scale(420)} height={scale(420)} viewBox="0 0 420 420">
            <Circle cx="430" cy="20" r="188" stroke="#111" strokeWidth="2" fill="none" />
          </Svg>
        </View>
        <View style={styles.decoInner}>
          <Svg width={scale(250)} height={scale(250)} viewBox="0 0 250 250">
            <Circle cx="250" cy="22" r="112" stroke="#111" strokeWidth="2" fill="none" />
          </Svg>
        </View>
        <View style={styles.decoDotLeft}>
          <Svg width={scale(62)} height={scale(62)} viewBox="0 0 62 62">
            <Circle cx="31" cy="31" r="31" fill="#cfcfcf" />
          </Svg>
        </View>
        <View style={styles.decoDotRight}>
          <Svg width={scale(58)} height={scale(58)} viewBox="0 0 58 58">
            <Circle cx="29" cy="29" r="29" fill="#cfcfcf" />
          </Svg>
        </View>
      </View>

      {/* Activity feed */}
      <View
        style={[
          styles.feed,
          { height: ITEM_HEIGHT * VISIBLE, overflow: "hidden", pointerEvents: "none" },
        ]}
      >
        <Animated.View style={{ transform: [{ translateY: scrollY }] }}>
          {LOOPED.map((text, i) => {
            const isActive = i % COUNT === activeIndex % COUNT;
            return (
              <Text
                key={i}
                numberOfLines={1}
                style={[
                  styles.feedItem,
                  {
                    height: ITEM_HEIGHT,
                    lineHeight: ITEM_HEIGHT,
                    fontSize: moderateScale(14),
                    color: "#1a1a1a",
                    opacity: isActive ? 1 : 0.15,
                  },
                ]}
              >
                {text}
              </Text>
            );
          })}
        </Animated.View>
      </View>

      {/* Main */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.main}>
          <Text style={[styles.title, { fontSize: moderateScale(36) }]}>
            tether
          </Text>
          <Text style={[styles.tagline, { fontSize: moderateScale(15) }]}>
            Less time planning, more time together.
          </Text>

          {/* Phone row */}
          <View style={styles.phoneRow}>
            <TouchableOpacity
              style={styles.countryPill}
              onPress={() => setDropdownOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Svg width={scale(20)} height={scale(20)} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="#111"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            <View style={styles.phonePill}>
              <TextInput
                style={[styles.phoneInput, { fontSize: moderateScale(15) }]}
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholder="phone number"
                placeholderTextColor="#aaa"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (error) setError("");
                }}
              />
            </View>
          </View>
{/* Email row */}
<View style={styles.phoneRow}>
  <View style={styles.phonePill}>
    <TextInput
      style={[styles.phoneInput, { fontSize: moderateScale(15) }]}
      keyboardType="email-address"
      autoCapitalize="none"
      autoComplete="email"
      placeholder="email address"
      placeholderTextColor="#aaa"
      value={email}
      onChangeText={(text) => {
        setEmail(text);
        if (error) setError("");
      }}
    />
  </View>
</View>

          {error ? (
            <Text style={{ color: "red", marginTop: 8, fontSize: 13 }}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { paddingVertical: height * 0.018 },
              (!isFormValid || loading) && { opacity: 0.4 },
            ]}
            onPress={handleSubmit}
            activeOpacity={0.5}
            disabled={!isFormValid || loading}
          >
            <Text style={[styles.submitText, { fontSize: moderateScale(15) }]}>
              {loading ? "sending code..." : "sign up/login →"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={styles.dropdownAnchor}>
            <View style={styles.dropdown}>
              {COUNTRY_CODES.map((c) => (
                <TouchableOpacity
                  key={`${c.flag}-${c.code}`}
                  style={[
                    styles.dropdownOption,
                    selectedCountry.flag === c.flag && styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedCountry(c);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownFlag}>{c.flag}</Text>
                  <Text style={[styles.dropdownLabel, { fontSize: moderateScale(14) }]}>
                    {c.label}
                  </Text>
                  <Text style={[styles.dropdownCode, { fontSize: moderateScale(14) }]}>
                    {c.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}