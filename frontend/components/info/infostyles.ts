import { Platform, StyleSheet } from 'react-native';

export const FONT_SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  slide: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  // Typography
  headline: {
    fontFamily: FONT_SERIF,
    fontSize: 34,
    fontWeight: '700',
    color: '#111',
    lineHeight: 42,
    marginBottom: 12,
  },
  subheadline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginTop: 8,
  },
  textBlock: {
    marginTop: 32,
    marginBottom: 16,
  },

  // Dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CCC',
  },

  // Slide 1 doodles
  doodleArea: {
    height: 220,
    position: 'relative',
  },
  doodleGlyph: {
    fontSize: 52,
    color: '#111',
  },
  doodleSpiral: {
    position: 'absolute',
    top: 20,
    left: 10,
  },
  doodleRefresh: {
    position: 'absolute',
    top: 10,
    right: 40,
    transform: [{ scaleX: -1 }],
  },
  doodleSparkle: {
    fontSize: 14,
    color: '#111',
    lineHeight: 18,
  },
  doodleSparkleLeft: {
    position: 'absolute',
    top: 90,
    left: 80,
    gap: 2,
  },
  doodleSparkleCenter: {
    position: 'absolute',
    top: 100,
    left: 160,
    gap: 2,
  },
  doodleNote: {
    position: 'absolute',
    top: 30,
    right: 0,
  },
  doodleWisp: {
    position: 'absolute',
    bottom: 10,
    left: 20,
  },

  // Slide 2 orbit
  orbitContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 260,
  },
  outerRing: {
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1.5,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbitLabel: {
    position: 'absolute',
    bottom: 12,
    fontSize: 8,
    letterSpacing: 1.5,
    color: '#888',
  },
  innerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbitLabelInner: {
    position: 'absolute',
    bottom: 8,
    fontSize: 7,
    letterSpacing: 1.5,
    color: '#888',
  },
  youDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#222',
  },
  orbitDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#444',
  },
  orbitDotInner: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#666',
  },

  // Slide 3 activity rows
  activityList: {
    marginTop: 16,
    gap: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  activityAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activityAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
  },
  activityMeta: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  activityChevron: {
    fontSize: 20,
    color: '#BBB',
  },
  getStartedBtn: {
    marginTop: 24,
    alignSelf: 'flex-start',
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    borderBottomWidth: 1.5,
    borderBottomColor: '#111',
    paddingBottom: 2,
  },

  // Slide 4 form
  formBlock: {
    paddingTop: 16,
  },
  formHeadline: {
    fontFamily: FONT_SERIF,
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    lineHeight: 36,
    marginBottom: 32,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputWrap: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: '#888',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#DDD',
    paddingVertical: 6,
    fontSize: 16,
    color: '#111',
  },
  inputActive: {
    borderBottomColor: '#111',
  },
  selectBox: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#DDD',
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectPlaceholder: {
    fontSize: 16,
    color: '#CCC',
  },
  selectChevron: {
    fontSize: 18,
    color: '#888',
  },
  completeBtn: {
    alignSelf: 'center',
    marginTop: 32,
    paddingBottom: 8,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
});