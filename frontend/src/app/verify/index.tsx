import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { moderateScale, scale, styles } from "../../../components/verify/verifystyle";

const getBaseUrl = () =>
  Platform.OS === "web"
    ? "http://localhost:3000"
    : "http://172.19.0.229:3000";

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
  
  const router = useRouter();

  // 5-digit code
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const inputs = useRef<(TextInput | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(COUNT);
  const { email, phone } = useLocalSearchParams<{ email?: string; phone?: string }>();

  // Mask email: "jo•••@gmail.com"
  const maskedEmail = email
    ? email.replace(/(.{2}).+(@.+)/, "$1•••$2")
    : "your email";

  const scrollY = useRef(
    new Animated.Value(-(COUNT * ITEM_HEIGHT) + ITEM_HEIGHT)
  ).current;
  const currentIndex = useRef<number>(COUNT);

  // Activity feed scroll
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

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle OTP input — supports autofill paste of 5-digit code
  const handleOtpChange = (text: string, index: number) => {
    if (text.length === 5 && index === 0) {
      const digits = text.split("");
      setCode(digits);
      inputs.current[4]?.focus();
      return;
    }

    const value = text.slice(-1);
    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < 4) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resendLoading) return;

    setResendLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${getBaseUrl()}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
        
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
      } else {
        setCode(["", "", "", "", ""]);
        setCountdown(10);
        inputs.current[0]?.focus();
      }
    } catch {
      setError("Could not reach server.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerify = async () => {
    const otp = code.join("");
    if (otp.length < 5) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${getBaseUrl()}/verify/check-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code.");
        setLoading(false);
        return;
      }

      if (data.user && data.user.id) {
        await AsyncStorage.setItem("user_id", data.user.id);
      }

      if (data.status === "existing_user") {
        router.replace("/homepage");
      } else {
        router.replace("/tut");
      }
    } catch {
      setError("Could not reach server.");
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.root}>
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

        <View style={styles.verifyMain}>
          <Text style={styles.verifyTitle}>Verify your{"\n"}email</Text>
          <Text style={styles.verifySubtitle}>
            Enter the code sent to {maskedEmail}.
          </Text>

          <View style={styles.otpRow}>
            {code.map((digit, index) => (
              <View key={index} style={styles.otpBox}>
                <TextInput
                  ref={(ref) => { inputs.current[index] = ref; }}
                  value={digit}
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Backspace" && !code[index] && index > 0) {
                      inputs.current[index - 1]?.focus();
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? 5 : 1}
                  style={styles.otpInput}
                  textAlign="center"
                />
              </View>
            ))}
          </View>

          {error ? <Text style={{ color: "red", marginTop: 8 }}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.verifyContinueBtn}
            activeOpacity={0.7}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyContinueText}>continue →</Text>
            )}
          </TouchableOpacity>

          {countdown > 0 ? (
            <Text style={styles.resendText}>Resend code in {countdown}s.</Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
              {resendLoading ? (
                <ActivityIndicator size="small" color="#111" />
              ) : (
                <Text style={[styles.resendText, { textDecorationLine: "underline" }]}>
                  Resend code
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}