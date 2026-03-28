import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { styles } from "../../../components/login/loginstyle";

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

const ITEM_HEIGHT = 22;
const COUNT = ACTIVITIES.length;
const VISIBLE = 3;
const LOOPED = [...ACTIVITIES, ...ACTIVITIES, ...ACTIVITIES];

export default function LoginPage() {
  const [phone, setPhone] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(COUNT);

  const scrollY = useRef(
    new Animated.Value(-(COUNT * ITEM_HEIGHT) + ITEM_HEIGHT)
  ).current;

  const currentIndex = useRef<number>(COUNT);

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

  const handleSubmit = () => {};

  return (
    <SafeAreaView style={styles.root}>
      <View style={[styles.decoWrap, { pointerEvents: "none" }]}>
        <View style={styles.decoOuter}>
          <Svg width={420} height={420} viewBox="0 0 420 420">
            <Circle
              cx="430"
              cy="20"
              r="188"
              stroke="#111"
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        </View>

        <View style={styles.decoInner}>
          <Svg width={250} height={250} viewBox="0 0 250 250">
            <Circle
              cx="250"
              cy="22"
              r="112"
              stroke="#111"
              strokeWidth="2"
              fill="none"
            />
          </Svg>
        </View>

        <View style={styles.decoDotLeft}>
          <Svg width={62} height={62} viewBox="0 0 62 62">
            <Circle cx="31" cy="31" r="31" fill="#cfcfcf" />
          </Svg>
        </View>

        <View style={styles.decoDotRight}>
          <Svg width={58} height={58} viewBox="0 0 58 58">
            <Circle cx="29" cy="29" r="29" fill="#cfcfcf" />
          </Svg>
        </View>
      </View>

      <View
        style={[
          styles.feed,
          {
            height: ITEM_HEIGHT * VISIBLE,
            overflow: "hidden",
            pointerEvents: "none",
          },
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.main}>
          <Text style={styles.title}>tether</Text>
          <Text style={styles.tagline}>
            Less time planning, more time together.
          </Text>

          <View style={styles.phoneRow}>
            <TouchableOpacity
              style={styles.countryPill}
              onPress={() => setDropdownOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{selectedCountry.flag}</Text>

              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
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
                style={styles.phoneInput}
                keyboardType="phone-pad"
                autoComplete="tel"
                value={phone}
                onChangeText={setPhone}
                underlineColorAndroid="transparent"
                placeholder=""
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.5}
          >
            <Text style={styles.submitText}>sign up/login →</Text>
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
                    selectedCountry.flag === c.flag &&
                      styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedCountry(c);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownFlag}>{c.flag}</Text>
                  <Text style={styles.dropdownLabel}>{c.label}</Text>
                  <Text style={styles.dropdownCode}>{c.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}