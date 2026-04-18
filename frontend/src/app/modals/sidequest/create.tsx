import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ✅ Fixed getBaseUrl
const getBaseUrl = () =>
  Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://172.19.0.229:3000'; 

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

// ─── Data Helpers ─────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS = Array.from({ length: 7 }, (_, i) => String(2024 + i));
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ['00','05','10','15','20','25','30','35','40','45','50','55'];
const AMPM = ['AM', 'PM'];
const MAX_ATT_OPTIONS = ['No Limit', ...Array.from({ length: 50 }, (_, i) => String(i + 1))];
const VISIBILITY_OPTIONS = ['Close Friends', 'Everyone'];

function buildDays(month: number, year: number): string[] {
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, '0'));
}

// ─── WheelPicker ──────────────────────────────────────────────────────────────

function WheelPicker({
  items,
  selectedIndex,
  onSelect,
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const listRef = useRef<FlatList>(null);
  const [internalIndex, setInternalIndex] = useState(selectedIndex);
  const padding = Math.floor(VISIBLE_ITEMS / 2);

  const paddedItems = [
    ...Array(padding).fill(''),
    ...items,
    ...Array(padding).fill(''),
  ];

  useEffect(() => {
    setInternalIndex(selectedIndex);
    const t = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 50);
    return () => clearTimeout(t);
  }, [selectedIndex]);

  const onScrollEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
    const realIndex = Math.max(0, Math.min(rawIndex, items.length - 1));
    setInternalIndex(realIndex);
    onSelect(realIndex);
    listRef.current?.scrollToOffset({
      offset: realIndex * ITEM_HEIGHT,
      animated: true,
    });
  };

  return (
    <View style={wheelStyles.container}>
      <View pointerEvents="none" style={wheelStyles.selectionHighlight} />
      <View pointerEvents="none" style={[wheelStyles.fade, wheelStyles.fadeTop]} />
      <View pointerEvents="none" style={[wheelStyles.fade, wheelStyles.fadeBottom]} />
      <FlatList
        ref={listRef}
        data={paddedItems}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const realIndex = index - padding;
          const isSelected = realIndex === internalIndex;
          return (
            <View style={wheelStyles.item}>
              <Text
                style={[
                  wheelStyles.itemText,
                  isSelected && wheelStyles.itemTextSelected,
                  item === '' && { opacity: 0 },
                ]}
              >
                {item || '.'}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const wheelStyles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
    position: 'relative',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    color: '#888',
    fontSize: 17,
    fontWeight: '400',
  },
  itemTextSelected: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    zIndex: 1,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    zIndex: 2,
  },
  fadeTop: {
    top: 0,
    backgroundColor: 'rgba(17,17,17,0.65)',
  },
  fadeBottom: {
    bottom: 0,
    backgroundColor: 'rgba(17,17,17,0.65)',
  },
});

// ─── PickerModal ──────────────────────────────────────────────────────────────

function PickerModal({
  visible,
  title,
  columns,
  onDone,
  onClose,
}: {
  visible: boolean;
  title: string;
  columns: { items: string[]; selectedIndex: number; onSelect: (i: number) => void }[];
  onDone: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={modalStyles.backdrop} onPress={onClose} />
      <View style={modalStyles.sheet}>
        <View style={modalStyles.toolbar}>
          <Pressable onPress={onClose}>
            <Text style={modalStyles.toolbarCancel}>Cancel</Text>
          </Pressable>
          <Text style={modalStyles.toolbarTitle}>{title}</Text>
          <Pressable onPress={onDone}>
            <Text style={modalStyles.toolbarDone}>Done</Text>
          </Pressable>
        </View>
        <View style={modalStyles.wheels}>
          {columns.map((col, i) => (
            <WheelPicker
              key={i}
              items={col.items}
              selectedIndex={col.selectedIndex}
              onSelect={col.onSelect}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
  },
  toolbarTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  toolbarCancel: {
    color: '#c8b1db',
    fontSize: 15,
  },
  toolbarDone: {
    color: '#c8b1db',
    fontSize: 15,
    fontWeight: '600',
  },
  wheels: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
});

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function CreateSidequestForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [detail, setDetail] = useState('');

  // FROM state
  const [fromMonthIdx, setFromMonthIdx] = useState(new Date().getMonth());
  const [fromDayIdx, setFromDayIdx] = useState(new Date().getDate() - 1);
  const [fromYearIdx, setFromYearIdx] = useState(0);
  const [fromHourIdx, setFromHourIdx] = useState(2);
  const [fromMinIdx, setFromMinIdx] = useState(0);
  const [fromAmPmIdx, setFromAmPmIdx] = useState(1);

  // TO state
  const [toMonthIdx, setToMonthIdx] = useState(new Date().getMonth());
  const [toDayIdx, setToDayIdx] = useState(new Date().getDate() - 1);
  const [toYearIdx, setToYearIdx] = useState(0);
  const [toHourIdx, setToHourIdx] = useState(4);
  const [toMinIdx, setToMinIdx] = useState(0);
  const [toAmPmIdx, setToAmPmIdx] = useState(1);

  const [maxAttIdx, setMaxAttIdx] = useState(0);
  const [visIdx, setVisIdx] = useState(0);

  const [tempFrom, setTempFrom] = useState({
    monthIdx: 0, dayIdx: 0, yearIdx: 0, hourIdx: 2, minIdx: 0, amPmIdx: 1,
  });
  const [tempTo, setTempTo] = useState({
    monthIdx: 0, dayIdx: 0, yearIdx: 0, hourIdx: 4, minIdx: 0, amPmIdx: 1,
  });
  const [tempMaxAtt, setTempMaxAtt] = useState(0);
  const [tempVis, setTempVis] = useState(0);

  const [activePicker, setActivePicker] = useState<'from' | 'to' | 'maxAtt' | 'vis' | null>(null);

  const fromDays = buildDays(fromMonthIdx, parseInt(YEARS[fromYearIdx]));
  const toDays = buildDays(toMonthIdx, parseInt(YEARS[toYearIdx]));
  const fromDaysTemp = buildDays(tempFrom.monthIdx, parseInt(YEARS[tempFrom.yearIdx]));
  const toDaysTemp = buildDays(tempTo.monthIdx, parseInt(YEARS[tempTo.yearIdx]));

  const formatDateLabel = (monthIdx: number, dayIdx: number, yearIdx: number, days: string[]) =>
    `${MONTHS[monthIdx]} ${days[dayIdx] ?? '01'}, ${YEARS[yearIdx]}`;
  const formatTimeLabel = (hourIdx: number, minIdx: number, amPmIdx: number) =>
    `${HOURS[hourIdx]}:${MINUTES[minIdx]} ${AMPM[amPmIdx]}`;

  const openFrom = () => {
    setTempFrom({ monthIdx: fromMonthIdx, dayIdx: fromDayIdx, yearIdx: fromYearIdx, hourIdx: fromHourIdx, minIdx: fromMinIdx, amPmIdx: fromAmPmIdx });
    setActivePicker('from');
  };
  const openTo = () => {
    setTempTo({ monthIdx: toMonthIdx, dayIdx: toDayIdx, yearIdx: toYearIdx, hourIdx: toHourIdx, minIdx: toMinIdx, amPmIdx: toAmPmIdx });
    setActivePicker('to');
  };
  const openMaxAtt = () => { setTempMaxAtt(maxAttIdx); setActivePicker('maxAtt'); };
  const openVis = () => { setTempVis(visIdx); setActivePicker('vis'); };

  const confirmFrom = () => {
    setFromMonthIdx(tempFrom.monthIdx); setFromDayIdx(tempFrom.dayIdx);
    setFromYearIdx(tempFrom.yearIdx); setFromHourIdx(tempFrom.hourIdx);
    setFromMinIdx(tempFrom.minIdx); setFromAmPmIdx(tempFrom.amPmIdx);
    setActivePicker(null);
  };
  const confirmTo = () => {
    setToMonthIdx(tempTo.monthIdx); setToDayIdx(tempTo.dayIdx);
    setToYearIdx(tempTo.yearIdx); setToHourIdx(tempTo.hourIdx);
    setToMinIdx(tempTo.minIdx); setToAmPmIdx(tempTo.amPmIdx);
    setActivePicker(null);
  };
  const confirmMaxAtt = () => { setMaxAttIdx(tempMaxAtt); setActivePicker(null); };
  const confirmVis = () => { setVisIdx(tempVis); setActivePicker(null); };

  // ✅ Build actual ISO times from picker state
  const buildIso = (
    monthIdx: number, dayIdx: number, yearIdx: number,
    hourIdx: number, minIdx: number, amPmIdx: number,
    days: string[]
  ): string => {
    const year = parseInt(YEARS[yearIdx]);
    const month = monthIdx;
    const day = parseInt(days[dayIdx] ?? '1');
    let hour = parseInt(HOURS[hourIdx]);
    if (AMPM[amPmIdx] === 'PM' && hour !== 12) hour += 12;
    if (AMPM[amPmIdx] === 'AM' && hour === 12) hour = 0;
    const minute = parseInt(MINUTES[minIdx]);
    return new Date(year, month, day, hour, minute, 0).toISOString();
  };

  const submit = async () => {
    const userId = await AsyncStorage.getItem('user_id');

    if (!userId) {
      Alert.alert('Error', 'User session not found. Please log in again.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Validation', 'Please enter a title for your sidequest.');
      return;
    }

    const startIso = buildIso(fromMonthIdx, fromDayIdx, fromYearIdx, fromHourIdx, fromMinIdx, fromAmPmIdx, fromDays);
    const endIso = buildIso(toMonthIdx, toDayIdx, toYearIdx, toHourIdx, toMinIdx, toAmPmIdx, toDays);

    if (new Date(endIso) <= new Date(startIso)) {
      Alert.alert('Validation', 'End time must be after start time.');
      return;
    }

    try {
      // ✅ Fixed URL
      const res = await fetch(`${getBaseUrl()}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          event_title: title.trim(),
          event_des: detail.trim() || '',
          time_of_event: startIso,
          time_event_end: endIso,
          location: location.trim() || 'TBD',
          max_attendees: maxAttIdx === 0 ? null : maxAttIdx,
          circle_status: visIdx === 0 ? 'close-friends' : 'everyone',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create sidequest');
      }

      console.log('✅ Sidequest created successfully');
      onClose();
    } catch (err) {
      console.error('❌ Error creating sidequest:', err);
      Alert.alert('Error', 'Could not save your sidequest. Try again.');
    }
  };

  return (
    <>
      <ScrollView
        style={[styles.flex, { backgroundColor: '#111' }]}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.handle} />
        <Text style={styles.dragLabel}>CREATE SIDEQUEST</Text>

        <TextInput
          style={styles.bigInput}
          placeholder="share what you're up to..."
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.lab}>FROM</Text>
        <Pressable style={styles.row} onPress={openFrom}>
          <View style={[styles.pill, styles.pillFlex]}>
            <Text style={styles.pillText}>
              {formatDateLabel(fromMonthIdx, fromDayIdx, fromYearIdx, fromDays)}
            </Text>
          </View>
          <View style={[styles.pill, styles.pillFlex]}>
            <Text style={styles.pillText}>
              {formatTimeLabel(fromHourIdx, fromMinIdx, fromAmPmIdx)}
            </Text>
          </View>
        </Pressable>

        <Text style={styles.lab}>TO</Text>
        <Pressable style={styles.row} onPress={openTo}>
          <View style={[styles.pill, styles.pillFlex]}>
            <Text style={styles.pillText}>
              {formatDateLabel(toMonthIdx, toDayIdx, toYearIdx, toDays)}
            </Text>
          </View>
          <View style={[styles.pill, styles.pillFlex]}>
            <Text style={styles.pillText}>
              {formatTimeLabel(toHourIdx, toMinIdx, toAmPmIdx)}
            </Text>
          </View>
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="📍 location"
          placeholderTextColor="#666"
          value={location}
          onChangeText={setLocation}
        />

        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Tell Your Friends What To Expect..."
          placeholderTextColor="#666"
          value={detail}
          onChangeText={setDetail}
          multiline
        />

        <Text style={styles.lab}>MAX ATTENDEES</Text>
        <Pressable style={styles.input} onPress={openMaxAtt}>
          <Text style={styles.pillText}>{MAX_ATT_OPTIONS[maxAttIdx]}</Text>
        </Pressable>

        <Text style={styles.lab}>VISIBILITY</Text>
        <Pressable style={styles.input} onPress={openVis}>
          <Text style={styles.pillText}>{VISIBILITY_OPTIONS[visIdx]}</Text>
        </Pressable>

        <View style={{ marginTop: 24 }}>
          <Pressable
            onPress={submit}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75 }]}
          >
            <Text style={styles.btnText}>share →</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* FROM Picker */}
      <PickerModal
        visible={activePicker === 'from'}
        title="From"
        columns={[
          { items: MONTHS, selectedIndex: tempFrom.monthIdx, onSelect: (i) => setTempFrom((p) => ({ ...p, monthIdx: i })) },
          { items: fromDaysTemp, selectedIndex: Math.min(tempFrom.dayIdx, fromDaysTemp.length - 1), onSelect: (i) => setTempFrom((p) => ({ ...p, dayIdx: i })) },
          { items: YEARS, selectedIndex: tempFrom.yearIdx, onSelect: (i) => setTempFrom((p) => ({ ...p, yearIdx: i })) },
          { items: HOURS, selectedIndex: tempFrom.hourIdx, onSelect: (i) => setTempFrom((p) => ({ ...p, hourIdx: i })) },
          { items: MINUTES, selectedIndex: tempFrom.minIdx, onSelect: (i) => setTempFrom((p) => ({ ...p, minIdx: i })) },
          { items: AMPM, selectedIndex: tempFrom.amPmIdx, onSelect: (i) => setTempFrom((p) => ({ ...p, amPmIdx: i })) },
        ]}
        onDone={confirmFrom}
        onClose={() => setActivePicker(null)}
      />

      {/* TO Picker */}
      <PickerModal
        visible={activePicker === 'to'}
        title="To"
        columns={[
          { items: MONTHS, selectedIndex: tempTo.monthIdx, onSelect: (i) => setTempTo((p) => ({ ...p, monthIdx: i })) },
          { items: toDaysTemp, selectedIndex: Math.min(tempTo.dayIdx, toDaysTemp.length - 1), onSelect: (i) => setTempTo((p) => ({ ...p, dayIdx: i })) },
          { items: YEARS, selectedIndex: tempTo.yearIdx, onSelect: (i) => setTempTo((p) => ({ ...p, yearIdx: i })) },
          { items: HOURS, selectedIndex: tempTo.hourIdx, onSelect: (i) => setTempTo((p) => ({ ...p, hourIdx: i })) },
          { items: MINUTES, selectedIndex: tempTo.minIdx, onSelect: (i) => setTempTo((p) => ({ ...p, minIdx: i })) },
          { items: AMPM, selectedIndex: tempTo.amPmIdx, onSelect: (i) => setTempTo((p) => ({ ...p, amPmIdx: i })) },
        ]}
        onDone={confirmTo}
        onClose={() => setActivePicker(null)}
      />

      {/* Max Attendees Picker */}
      <PickerModal
        visible={activePicker === 'maxAtt'}
        title="Max Attendees"
        columns={[
          { items: MAX_ATT_OPTIONS, selectedIndex: tempMaxAtt, onSelect: setTempMaxAtt },
        ]}
        onDone={confirmMaxAtt}
        onClose={() => setActivePicker(null)}
      />

      {/* Visibility Picker */}
      <PickerModal
        visible={activePicker === 'vis'}
        title="Visibility"
        columns={[
          { items: VISIBILITY_OPTIONS, selectedIndex: tempVis, onSelect: setTempVis },
        ]}
        onDone={confirmVis}
        onClose={() => setActivePicker(null)}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  dragLabel: {
    textAlign: 'center',
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 16,
  },
  bigInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  lab: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 999,
    padding: 10,
  },
  pillFlex: { flex: 1 },
  pillText: {
    color: '#fff',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  btn: {
    backgroundColor: '#c8b1db',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});