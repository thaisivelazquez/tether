import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import Arrow11Svg from '../../../components/welcome/arrow11.svg';
import CircleSvg from '../../../components/welcome/circle.svg';
import ParticlePattern04Svg from '../../../components/welcome/particlepattern04.svg';
import ParticlePattern041Svg from '../../../components/welcome/particlepattern041.svg';
import ParticlePattern042Svg from '../../../components/welcome/particlepattern042.svg';
import ParticlePattern13Svg from '../../../components/welcome/particlepattern13.svg';
import ScribbleLine08Svg from '../../../components/welcome/scribbleline08.svg';
import ScribbleLine26Svg from '../../../components/welcome/scribbleline26.svg';

import Event1 from '../../../components/welcome/event1.svg';
import Event2 from '../../../components/welcome/event2.svg';
import Event3 from '../../../components/welcome/event3.svg';

import { styles } from "../../../components/welcome/welcomestyles";

function Slide1() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <View style={{ position: 'relative', width: '100%', height: '55%' }}>
        <Arrow11Svg style={styles.doodleRefresh} />
        <ParticlePattern04Svg style={styles.doodleSparkleLeft} />
        <ParticlePattern041Svg style={styles.doodleSparkleLeft1} />
        <ParticlePattern042Svg style={styles.doodleSparkleLeft2} />
        <ParticlePattern13Svg style={styles.doodleSparkleCenter} />
        <ScribbleLine08Svg style={styles.doodleNote} />
        <ScribbleLine26Svg style={styles.doodleWisp} />
      </View>
      <View style={{ paddingHorizontal: 32, alignItems: 'center', marginTop: 280 }}>
        <Text style={{
          width: '100%',
          fontSize: 50,
          fontWeight: '700',
          color: '#111',
          letterSpacing: -0.8,
          marginBottom: 14,
          textAlign: 'center',
        }}>
          Life gets busy.
        </Text>
        <Text style={{
          width: '100%',
          fontSize: 28,
          lineHeight: 26,
          fontWeight: '700',
          color: '#111',
          textAlign: 'center',
          letterSpacing: 1.2,
        }}>
          But seeing friends{'\n'}shouldn't be{'\n'}this hard.
        </Text>
      </View>
    </View>
  );
}

function Slide2() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <View style={{ position: 'relative', width: '100%', height: '55%' }}>
        <CircleSvg style={styles.circle} />
      </View>
      <View style={{ paddingHorizontal: 32, alignItems: 'center', marginTop: 280 }}>
        <Text style={{
          width: '100%',
          fontSize: 50,
          fontWeight: '700',
          color: '#111',
          letterSpacing: -0.8,
          marginBottom: 14,
          textAlign: 'center',
        }}>
          Everyone you{'\n'}care about.
        </Text>
        <Text style={{
          width: '100%',
          fontSize: 28,
          lineHeight: 26,
          fontWeight: '700',
          color: '#111',
          textAlign: 'center',
          letterSpacing: 1.2,
        }}>
          tether helps you bring{'\n'}them into your day.{'  '}
          <Text style={{ fontSize: 16 }}>☀</Text>
        </Text>
      </View>
    </View>
  );
}

function ActivityRow({ name, location, time, going }: {
  name: string;
  location: string;
  time: string;
  going: string;
}) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityAvatar}>
        <Text style={styles.activityAvatarText}>{name[0]}</Text>
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityName}>{name}</Text>
        <Text style={styles.activityMeta}>
          {location}{'  ·  '}{time}{'  ·  '}
          <Text style={{ fontSize: 14 }}>{going}</Text>
        </Text>
      </View>
      <Text style={styles.activityChevron}>›</Text>
    </View>
  );
}

function Slide3() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <View style={{ width: '100%', height: '55%', paddingHorizontal: 24, paddingTop: 24 }}>
        <View style={{ position: 'relative', width: '100%', height: '55%' }}>

          <Event1 style={styles.activityList} />
          <Event2 style={styles.activityList} />
          <Event3 style={styles.activityList} />
      </View>
      </View>

      <View style={{ paddingHorizontal: 32, alignItems: 'center', marginTop: 24 }}>
        <Text style={{
          width: '100%',
          fontSize: 34,
          fontWeight: '800',
          color: '#111',
          letterSpacing: -0.8,
          marginBottom: 14,
          textAlign: 'center',
        }}>
          No big plans{'\n'}needed.
        </Text>
        <Text style={{
          width: '100%',
          fontSize: 18,
          lineHeight: 26,
          fontWeight: '700',
          color: '#111',
          textAlign: 'center',
          letterSpacing: -0.2,
        }}>
          Just some sidequests and{'\n'}the right people.
        </Text>
        <TouchableOpacity
          style={{ marginTop: 24, alignSelf: 'center' }}
          onPress={() => router.push('/info')}
        >
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#111',
            borderBottomWidth: 1.5,
            borderBottomColor: '#111',
            paddingBottom: 2,
          }}>
            Get started  →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const SLIDES = [Slide1, Slide2, Slide3];

export default function Welcome() {
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const whiteOverlay = useRef(new Animated.Value(1)).current;

  // Fade from white on mount
  useEffect(() => {
    Animated.timing(whiteOverlay, {
      toValue: 0,
      duration: 800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9F6" />

        <FlatList
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          renderItem={({ item: Slide, index }) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View style={{ width, opacity, flex: 1 }}>
                <Slide />
              </Animated.View>
            );
          }}
        />

        {/* Animated progress dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (i - 1) * width,
                i * width,
                (i + 1) * width,
              ],
              outputRange: [6, 22, 6],
              extrapolate: 'clamp',
            });

            const dotColor = scrollX.interpolate({
              inputRange: [
                (i - 1) * width,
                i * width,
                (i + 1) * width,
              ],
              outputRange: ['#CCC', '#111', '#CCC'],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
              />
            );
          })}
        </View>
      </SafeAreaView>

      {/* White overlay — fades out on mount */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          opacity: whiteOverlay,
        }}
      />
    </View>
  );
}