import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { styles } from '../../../components/welcome/welcomestyles';

const Arrow11Img = require('../../../components/welcome/arrow11.png');
const CircleImg = require('../../../components/welcome/circle.png');
const ParticlePattern04Img = require('../../../components/welcome/particlepattern04.png');
const ParticlePattern041Img = require('../../../components/welcome/particlepattern041.png');
const ParticlePattern042Img = require('../../../components/welcome/particlepattern042.png');
const ParticlePattern13Img = require('../../../components/welcome/particlepattern13.png');
const ScribbleLine08Img = require('../../../components/welcome/scribbleline08.png');
const ScribbleLine26Img = require('../../../components/welcome/scribbleline26.png');
const Event1Img = require('../../../components/welcome/event1.png');
const Event2Img = require('../../../components/welcome/event2.png');
const Event3Img = require('../../../components/welcome/event3.png');


function Slide1() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <View style={{ position: 'relative', width: '100%', height: '55%' }}>
        <Image source={Arrow11Img} style={styles.doodleRefresh} resizeMode="contain" />
        <Image source={ParticlePattern04Img} style={styles.doodleSparkleLeft} resizeMode="contain" />
        <Image source={ParticlePattern041Img} style={styles.doodleSparkleLeft1} resizeMode="contain" />
        <Image source={ParticlePattern042Img} style={styles.doodleSparkleLeft2} resizeMode="contain" />
        <Image source={ParticlePattern13Img} style={styles.doodleSparkleCenter} resizeMode="contain" />
        <Image source={ScribbleLine08Img} style={styles.doodleNote} resizeMode="contain" />
        <Image source={ScribbleLine26Img} style={styles.doodleWisp} resizeMode="contain" />
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
        <Image source={CircleImg} style={styles.circle} resizeMode="contain" />
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
          <Image source={Event1Img} style={styles.activityList} resizeMode="contain" />
          <Image source={Event2Img} style={styles.activityList} resizeMode="contain" />
          <Image source={Event3Img} style={styles.activityList} resizeMode="contain" />
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
