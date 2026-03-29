import React, { useState } from "react";
import { View, Text, SafeAreaView, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { styles } from "../../../components/verify/verifystyle";

export default function VerifyPage() {
  const { phone, countryCode } = useLocalSearchParams<{
    phone?: string;
    countryCode?: string;
  }>();

  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const maskedPhone = phone
    ? `${countryCode ?? ""} ${String(phone)}`
    : "+ XX XXX-XXX-XXXX";

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

      <View
        style={[
          styles.feed,
          {
            height: 22 * 3,
            overflow: "hidden",
            pointerEvents: "none",
          },
        ]}
      >
        <Text style={[styles.feedItem, { opacity: 0.15 }]}>
          studying at butler library till nine
        </Text>
        <Text style={[styles.feedItem, { opacity: 1 }]}>
          wine and whatever on my rooftop!
        </Text>
        <Text style={[styles.feedItem, { opacity: 0.15 }]}>
          running @ riverside in 30, COME
        </Text>
        <Text style={[styles.feedItem, { opacity: 0.15 }]}>
          reel scrolling time
        </Text>
        <Text style={[styles.feedItem, { opacity: 0.15 }]}>
          sledding after the blizzard 3pm ish?
        </Text>
      </View>
    </SafeAreaView>
  );
}