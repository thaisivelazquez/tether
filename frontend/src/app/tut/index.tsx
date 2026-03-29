import React, { useState } from "react";
import {
  Image,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { styles } from "../../../components/tut/tutstyles";

const SLIDES = [
  require("../../../components/tut/slide1.png"),
  require("../../../components/tut/slide5.png"),
  require("../../../components/tut/slide4.png"),
  require("../../../components/tut/slide3.png"),
  
];

export default function TutPage() {
  const { width, height } = useWindowDimensions();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleTap = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
    }
  };

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
        <Image
          source={SLIDES[currentSlide]}
          style={{
            width,
            height,
          }}
          resizeMode="contain"
        />
      </View>
    </Pressable>
  );
}