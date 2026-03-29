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
import { styles } from "../../../components/welcome/welcomestyles";

// ─── Slide 1: Life gets busy ────────────────────────────────────────────────

function Slide1() {
  return (
    <View style={styles.slide}>
      <View style={styles.doodleArea}>
        <View style={styles.doodleSpiral}>
          {/* <Text style={styles.doodleGlyph}>◎</Text> */}
        </View>
        <View style={styles.doodleRefresh}>
          {/* <Text style={styles.doodleGlyph}>↻</Text> */}
        </View>
        <View style={styles.doodleSparkleLeft}>
          {/* <Text style={styles.doodleSparkle}>✦</Text> */}
          {/* <Text style={[styles.doodleSparkle, { fontSize: 10 }]}>✦</Text> */}
        </View>
        <View style={styles.doodleSparkleCenter}>
          {/* <Text style={styles.doodleSparkle}>✦</Text> */}
          {/* <Text style={[styles.doodleSparkle, { fontSize: 8 }]}>✦</Text> */}
        </View>
        <View style={styles.doodleNote}>
          {/* <Text style={styles.doodleGlyph}>𝄞</Text> */}
        </View>
        <View style={styles.doodleWisp}>
          {/* <Text style={[styles.doodleGlyph, { fontSize: 22 }]}>꩜</Text> */}
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.headline}>Life gets busy.</Text>
        <Text style={styles.subheadline}>
          But seeing friends{'\n'}shouldn't be{'\n'}this hard.
        </Text>
      </View>
    </View>
  );
}

// ─── Slide 2: Everyone in orbit ─────────────────────────────────────────────

// function OrbitDiagram() {
//   return (
//     <View style={styles.orbitContainer}>
//       <View style={styles.outerRing}>
//         {/* <Text style={styles.orbitLabel}>OUTER RING</Text> */}
//         <View style={styles.innerRing}>
//           {/* <Text style={styles.orbitLabelInner}>INNER RING</Text> */}
//           <View style={styles.youDot} />
//         </View>
//         <View style={[styles.orbitDot, { top: 30, left: '50%', marginLeft: -6 }]} />
//         <View style={[styles.orbitDot, { bottom: 30, left: '50%', marginLeft: -6 }]} />
//         <View style={[styles.orbitDot, { left: 30, top: '50%', marginTop: -6 }]} />
//         <View style={[styles.orbitDot, { right: 30, top: '50%', marginTop: -6 }]} />
//         <View style={[styles.orbitDotInner, { top: '28%', left: '28%' }]} />
//         <View style={[styles.orbitDotInner, { top: '28%', right: '28%' }]} />
//       </View>
//     </View>
//   );
// }

function Slide2() {
  return (
    <View style={styles.slide}>
      {/* <OrbitDiagram /> */}
      <View style={styles.textBlock}>
        <Text style={styles.headline}>
          Everyone you{'\n'}care about is{'\n'}already in orbit.
        </Text>
        <Text style={styles.body}>
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
          {location}  ·  {time}  ·  {going}
        </Text>
      </View>
      <Text style={styles.activityChevron}>›</Text>
    </View>
  );
}

function Slide3() {
  return (
    <View style={styles.slide}>
      <View style={styles.activityList}>
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
      <View style={styles.textBlock}>
        <Text style={styles.headline}>
          No big plans{'\n'}needed.
        </Text>
        <Text style={styles.subheadline}>
          Just some sidequests and{'\n'}the right people.
        </Text>
        <TouchableOpacity style={styles.getStartedBtn}>
          <Text style={styles.getStartedText}>Get started  →</Text>
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