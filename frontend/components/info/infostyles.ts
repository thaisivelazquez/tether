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
    marginBottom: 28,
  },

  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },

  inputGroup: {
    flex: 1,
  },

  inputLabel: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#777',
    marginBottom: 6,
    fontWeight: '600',
  },

  inputBox: {
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  inputText: {
    fontSize: 15,
    color: '#111',
  },

  fullWidthGroup: {
    marginBottom: 18,
  },

  completeBtn: {
    alignSelf: 'center',
    marginTop: 40,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  completeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
    
    input: {
      borderBottomWidth: 1.5,
      borderBottomColor: '#010000',
      paddingVertical: 6,
      fontSize: 16,
      color: '#111',
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
      color: '#d0d0d0',
    },
    selectChevron: {
      fontSize: 18,
      color: '#888',
    },

  });