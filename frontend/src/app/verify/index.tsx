import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { moderateScale, scale, styles } from "../../../components/verify/verifystyle";

const ACTIVITIES = [
  "studying at butler library till nine",
  "wine and whatever on my rooftop!",
  "running @ riverside in 30, COME",
  "reel scrolling time",
  "sledding after the blizzard 3pm ish?",
];

const ITEM_HEIGHT = scale(22);
const COUNT = ACTIVITIES.length;
const VISIBLE = 3;
const LOOPED = [...ACTIVITIES, ...ACTIVITIES, ...ACTIVITIES];

export default function VerifyPage() {
  const { phone, countryCode } = useLocalSearchParams<{
    phone?: string;
    countryCode?: string;
  }>();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState<number>(COUNT);

  const maskedPhone = phone
    ? `${countryCode ?? ""} ${String(phone)}`
    : "+ XX XXX-XXX-XXXX";

  // ── Carousel (identical to LoginPage) ──
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

  return (
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

      {/* Activity feed carousel */}
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

      {/* Main content */}
      <View style={styles.verifyMain}>
        <Text style={styles.verifyTitle}>Verify your{"\n"}number</Text>
        <Text style={styles.verifySubtitle}>
          Enter the OTP sent to {maskedPhone}.
        </Text>

        <View style={styles.otpRow}>
          {code.map((digit, index) => (
            <View key={index} style={styles.otpBox}>
              <TextInput
                value={digit}
                onChangeText={(text) => {
                  const next = [...code];
                  next[index] = text.slice(-1);
                  setCode(next);
                }}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.otpInput}
                textAlign="center"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.verifyContinueBtn} activeOpacity={0.7}>
          <Text style={styles.verifyContinueText}>continue →</Text>
        </TouchableOpacity>

        <Text style={styles.resendText}>Resend code in XX seconds.</Text>
      </View>

    </SafeAreaView>
  );
}