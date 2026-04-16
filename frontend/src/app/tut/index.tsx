import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, useWindowDimensions, View } from "react-native";
import { styles } from "../../../components/tut/tutstyles";

const Slide1Img = require('../../../components/tut/slide1.png');
const Slide2Img = require('../../../components/tut/slide2.png');
const Slide3Img = require('../../../components/tut/slide3.png');
const Slide4Img = require('../../../components/tut/slide4.png');
const Slide5Img = require('../../../components/tut/slide5.png');
const Slide6Img = require('../../../components/tut/slide6.png');
const Slide7Img = require('../../../components/tut/slide7.png');

const SLIDES = [Slide1Img, Slide2Img, Slide7Img, Slide6Img, Slide3Img, Slide5Img, Slide4Img];

export default function TutPage() {
  const { width, height } = useWindowDimensions();
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  const handleTap = () => {
    if (currentSlide < SLIDES.length - 1) {
      fadeAnim.setValue(0);
      setCurrentSlide((prev) => prev + 1);
    } else {
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

  const currentSource = SLIDES[currentSlide];

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
          <Image
            source={currentSource}
            style={{ width, height }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Pressable>
  );
}
