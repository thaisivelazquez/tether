import { useRouter } from "expo-router"; // 👈 add this
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, useWindowDimensions, View } from "react-native";
import { styles } from "../../../components/tut/tutstyles";

import Slide1 from "../../../components/tut/slide1.svg";
import Slide2 from "../../../components/tut/slide2.svg";
import Slide3 from "../../../components/tut/slide3.svg";
import Slide4 from "../../../components/tut/slide4.svg";
import Slide5 from "../../../components/tut/slide5.svg";
import Slide6 from "../../../components/tut/slide6.svg";
import Slide7 from "../../../components/tut/slide7.svg";

const SLIDES = [Slide1, Slide2, Slide7, Slide6, Slide3, Slide5, Slide4];

export default function TutPage() {
  const { width, height } = useWindowDimensions();
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter(); // 👈 init router

  const handleTap = () => {
    if (currentSlide < SLIDES.length - 1) {
      fadeAnim.setValue(0);
      setCurrentSlide((prev) => prev + 1);
    } else {
      // 👇 navigate when last slide is reached
      router.push("/info");
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [currentSlide]);

  const CurrentSlide = SLIDES[currentSlide];

  return (
    <Pressable style={styles.screen} onPress={handleTap}>
      <View
        style={{
          width,
          height,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f0",
        }}
      >
        <Animated.View style={{ opacity: fadeAnim, width, height }}>
          <CurrentSlide width={width} height={height} />
        </Animated.View>
      </View>
    </Pressable>
  );
}