import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CircleDiagram } from '../../components/CircleDiagram';
import { PrimaryButton } from '../../components/PrimaryButton';
import { spacing, tokens, typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function CircleEditModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { users, currentUser, circleMemberIds, setUserRingLevel, removeFromCircle } = useApp();
  const members = users.filter((u) => circleMemberIds.includes(u.id));

  return (
    <View style={[styles.flex, { paddingTop: insets.top + spacing.md, backgroundColor: tokens.surface }]}>
      <View style={styles.handle} />
      <Text style={[typography.caption, styles.top]}>EDIT CIRCLE</Text>
      <Text style={[typography.caption, styles.hint]}>
        TAP SOMEONE TO MOVE THEM BETWEEN RINGS
      </Text>
      <Text style={[typography.caption, styles.hint]}>
        TAP AND HOLD A PERSON FOR MORE OPTIONS
      </Text>
      <CircleDiagram
        currentUser={currentUser}
        members={members}
        mode="edit"
        onRingChange={setUserRingLevel}
        onRemove={removeFromCircle}
      />
      <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
        <PrimaryButton
          label="SAVE CHANGES"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.border,
    marginBottom: spacing.sm,
  },
  top: { textAlign: 'center', color: tokens.text, marginBottom: spacing.sm },
  hint: { textAlign: 'center', color: tokens.textSecondary, marginBottom: 4, paddingHorizontal: spacing.md },
});
