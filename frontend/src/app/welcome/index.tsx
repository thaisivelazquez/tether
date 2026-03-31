import React, { useRef, useState } from 'react';
import {
  Animated,
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

import { useRouter } from 'expo-router';
import ParticlePattern041Svg from '../../../components/welcome/particlepattern041.svg';
import ParticlePattern042Svg from '../../../components/welcome/particlepattern042.svg';


import ParticlePattern13Svg from '../../../components/welcome/particlepattern13.svg';
import ScribbleLine08Svg from '../../../components/welcome/scribbleline08.svg';
import ScribbleLine26Svg from '../../../components/welcome/scribbleline26.svg';
import { styles } from "../../../components/welcome/welcomestyles";

// need to add the photos
// ─── Slide 1: Life gets busy ────────────────────────────────────────────────

function Slide1() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>

      {/* Doodles — top 55% */}
      <View style={{ position: 'relative', width: '100%', height: '55%' }}>
        <Arrow11Svg style={styles.doodleRefresh} />


        <ParticlePattern04Svg style={styles.doodleSparkleLeft} />
        <ParticlePattern041Svg style={styles.doodleSparkleLeft1} />
        <ParticlePattern042Svg style={styles.doodleSparkleLeft2} />




        <ParticlePattern13Svg style={styles.doodleSparkleCenter} />
        <ScribbleLine08Svg style={styles.doodleNote} />
        <ScribbleLine26Svg style={styles.doodleWisp} />
      </View>
      <View style={{
        paddingHorizontal: 32,
        alignItems: 'center',
        marginTop: 280,
      }}>
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

      {/* Doodles — top 55% */}
      <View style={{ position: 'relative', width: '100%', height: '55%' }}>
        <CircleSvg style={styles.circle} />
      </View>
      <View style={{
        paddingHorizontal: 32,
        alignItems: 'center',
        marginTop: 280,
      }}>
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
          tether helps you bring{'\n'}them into your day.{'  '}
          <Text style={{ fontSize: 16 }}>☀</Text>
        </Text>
      </View>

    </View>
  );
}

// ─── Slide 3: No big plans needed ───────────────────────────────────────────

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
        <ActivityRow
          name="John D."
          location="studying at butler..."
          time="1h and tnr"
          going="20 going"
        />
        <ActivityRow
          name="John D."
          location="studying at butler..."
          time="GPA · tomorrow"
          going="20 going"
        />
        <ActivityRow
          name="John D."
          location="studying at butler..."
          time="1h and tnr"
          going="20 going"
        />
      </View>

      <View style={{
        paddingHorizontal: 32,
        alignItems: 'center',
        marginTop: 24,
      }}>
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

// ─── Slide 4: Tell us about yourself ────────────────────────────────────────

// function Slide4() {
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [birthday, setBirthday] = useState('');
//   const [location, setLocation] = useState('');
//   const [affiliation, setAffiliation] = useState('');

//   return (
//     <View style={styles.slide}>
//       <View style={styles.formBlock}>
//         <Text style={styles.formHeadline}>
//           one last thing—{'\n'}tell us about yourself.
//         </Text>

//         <View style={styles.formRow}>
//           <View style={[styles.inputWrap, { flex: 1, marginRight: 8 }]}>
//             <Text style={styles.inputLabel}>FIRST NAME</Text>
//             <TextInput
//               style={[styles.input, styles.inputActive]}
//               value={firstName}
//               onChangeText={setFirstName}
//               placeholderTextColor="#ccc"
//             />
//           </View>
//           <View style={[styles.inputWrap, { flex: 1 }]}>
//             <Text style={styles.inputLabel}>LAST NAME</Text>
//             <TextInput
//               style={styles.input}
//               value={lastName}
//               onChangeText={setLastName}
//               placeholderTextColor="#ccc"
//             />
//           </View>
//         </View>

//         <View style={styles.inputWrap}>
//           <Text style={styles.inputLabel}>BIRTHDAY</Text>
//           <TextInput
//             style={styles.input}
//             value={birthday}
//             onChangeText={setBirthday}
//             placeholder="DD/MM"
//             placeholderTextColor="#aaa"
//           />
//         </View>

//         <View style={styles.inputWrap}>
//           <Text style={styles.inputLabel}>LOCATION</Text>
//           <View style={styles.selectBox}>
//             <Text style={styles.selectPlaceholder}>{location || ''}</Text>
//             <Text style={styles.selectChevron}>⌄</Text>
//           </View>
//         </View>

//         <View style={styles.inputWrap}>
//           <Text style={styles.inputLabel}>AFFILIATION</Text>
//           <View style={styles.selectBox}>
//             <Text style={styles.selectPlaceholder}>{affiliation || ''}</Text>
//             <Text style={styles.selectChevron}>⌄</Text>
//           </View>
//         </View>
//       </View>

//       <TouchableOpacity style={styles.completeBtn}>
//         <Text style={styles.completeBtnText}>Complete sign up  →</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// ─── Carousel ────────────────────────────────────────────────────────────────

// const SLIDES = [Slide1, Slide2, Slide3, Slide4];
const SLIDES = [Slide1, Slide2, Slide3];

export default function Welcome() {
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
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
  );
}