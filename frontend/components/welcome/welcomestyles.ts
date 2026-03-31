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
  paddingTop: 24,
  paddingHorizontal: 24,
},
  // Typography
headline: {
  fontSize: 34,
  lineHeight: 38,
  fontWeight: '800',
  color: '#111',
  letterSpacing: -0.8,
  textAlign: 'left',
},
body: {
  fontSize: 16,
  color: '#444',
  lineHeight: 24,
  marginTop: 8,
  textAlign: 'left',
},

subheadline: {
  fontSize: 17,
  lineHeight: 22,
  fontWeight: '700',
  color: '#111',
  textAlign: 'left',
  letterSpacing: -0.2,
},

textBlock: {
  marginTop: 28,
  marginBottom: 16,
  alignItems: 'flex-start',
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
  position: 'relative',
  width: '100%',
  height: 220,
  marginTop: 4,
},

doodleSpiral: {
  position: 'absolute',
  left: 50,
  top: 10,
  width: 192,
  height: 92,
},

doodleRefresh: {
  position: 'absolute',
  right: 100,
  bottom: 100,
  width: 150,
  height: 150,
},

doodleSparkleLeft: {
  position: 'absolute',
  left: 180,
  top: 218,
  width: 60,
  height: 60,
},

circle: {
  position: 'absolute',
  left: 28,
  top: 120,
  width: 360,
  height: 360,
},

doodleSparkleLeft1: {
  position: 'absolute',
  left: 290,
  bottom: -135,
  width: 60,
  height: 60,
},


doodleSparkleLeft2: {
  position: 'absolute',
  left: 210,
  top: 308,
  width: 60,
  height: 60,
},



doodleSparkleCenter: {
  position: 'absolute',
  right: 3,
  top: 98,
  width: 120,
  height: 120,
},

doodleNote: {
  position: 'absolute',
  left: -30,
  top: 180,
  width: 180,
  height: 180,
},

doodleWisp: {
  position: 'absolute',
  right: 220,
  top: 360,
  width: 158,
  height: 158,
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
    marginLeft: -11,
    height : 234, 
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
    flex: 1,
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
    alignSelf: 'flex-end',
    paddingBottom: 8,
  },
  completeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
});