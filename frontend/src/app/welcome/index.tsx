import React, { useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const { width, height } = Dimensions.get("window");


import { styles } from "../../../components/welcome/welcomestyles";


type Slide = {
  key: string;
  kind: "orbit" | "plans" | "busy" | "form";
  title: string;
  subtitle?: string;
};

const SLIDES: Slide[] = [
  {
    key: "orbit",
    kind: "orbit",
    title: "Everyone you\ncare about is\nalready in orbit.",
    subtitle: "tether helps you bring\nthem into your day.",
  },
  {
    key: "plans",
    kind: "plans",
    title: "No big plans\nneeded.",
    subtitle: "Just some sidequests and\nthe right people.",
  },
  {
    key: "busy",
    kind: "busy",
    title: "Life gets busy.",
    subtitle: "But seeing friends\nshouldn’t be\nthis hard.",
  },
  {
    key: "form",
    kind: "form",
    title: "one last thing—\ntell us about yourself.",
  },
];

export default function WelcomePage() {
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    setActiveIndex(index);
  };

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
      setActiveIndex((prev) => prev + 1);
    }
  };

  const renderProgress = () => (
    <View style={styles.progressWrap}>
      {SLIDES.map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            i === activeIndex && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );

  const OrbitArt = () => (
    <View style={styles.artWrap}>
      <View style={styles.orbitOuter}>
        <View style={styles.orbitInner} />
        <View style={[styles.orbitDot, { top: 20, left: 74 }]} />
        <View style={[styles.orbitDot, { top: 56, right: 50 }]} />
        <View style={[styles.orbitDotSmall, { top: 96, left: 110 }]} />
        <View style={[styles.orbitDotSmall, { bottom: 32, right: 76 }]} />
        <Text style={styles.orbitTinyA}>everyone</Text>
        <Text style={styles.orbitTinyB}>here</Text>
      </View>
    </View>
  );

  const PlansArt = () => (
    <View style={styles.artWrap}>
      <View style={styles.cardsStack}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={styles.planCard}>
            <View style={styles.planCardTop}>
              <Text style={styles.planMeta}>Join in · river rig</Text>
              <Text style={styles.planArrow}>›</Text>
            </View>
            <Text style={styles.planTitle}>
              studying at butler… tea and tiry
            </Text>
            <View style={styles.planCardBottom}>
              <Text style={styles.planSub}>📍 Butler Library</Text>
              <Text style={styles.planSub}>Viewed</Text>
              <Text style={styles.planSub}>2:20 pm</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const BusyArt = () => (
    <View style={styles.artWrap}>
      <View style={styles.busyArtBox}>
        <View style={styles.spiralLarge}>
          <View style={styles.spiralLarge2}>
            <View style={styles.spiralLarge3} />
          </View>
        </View>

        <View style={styles.loopTopRight} />
        <View style={styles.loopBottomLeft} />
        <View style={styles.scribbleRight} />

        <Text style={[styles.star, { top: 72, left: 124 }]}>✳</Text>
        <Text style={[styles.star, { top: 96, left: 148 }]}>✳</Text>
        <Text style={[styles.star, { top: 62, left: 162 }]}>✳</Text>
      </View>
    </View>
  );

  const FormSlide = (title: string) => (
    <View style={styles.formSlide}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>{title}</Text>
      </View>

      <View style={styles.formFields}>
        <View style={styles.formRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>FIRST NAME</Text>
            <TextInput style={styles.focusField} />
          </View>

          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>LAST NAME</Text>
            <TextInput style={styles.field} />
          </View>
        </View>

        <View style={styles.fullField}>
          <Text style={styles.fieldLabel}>BIRTHDAY</Text>
          <TextInput style={styles.field} placeholder="DD/MM" />
        </View>

        <View style={styles.fullField}>
          <Text style={styles.fieldLabel}>LOCATION</Text>
          <View style={styles.selectField}>
            <Text style={styles.selectFieldText}></Text>
            <Text style={styles.selectFieldChevron}>⌄</Text>
          </View>
        </View>

        <View style={styles.fullField}>
          <Text style={styles.fieldLabel}>AFFILIATION</Text>
          <View style={styles.selectField}>
            <Text style={styles.selectFieldText}></Text>
            <Text style={styles.selectFieldChevron}>⌄</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.completeBtn} activeOpacity={0.8}>
        <Text style={styles.completeBtnText}>Complete sign up</Text>
        <Text style={styles.completeBtnArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Slide }) => {
    return (
      <View style={styles.slide}>
        {item.kind === "orbit" && <OrbitArt />}
        {item.kind === "plans" && <PlansArt />}
        {item.kind === "busy" && <BusyArt />}
        {item.kind === "form" ? (
          FormSlide(item.title)
        ) : (
          <>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              {!!item.subtitle && (
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={goNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>Next</Text>
              <Text style={styles.nextBtnArrow}>→</Text>
            </TouchableOpacity>
          </>
        )}

        {renderProgress()}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}
