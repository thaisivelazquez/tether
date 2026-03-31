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

    buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',        // ← this is the key fix
    justifyContent: 'flex-start',
    gap: 12,
    marginTop: 16,
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


  fullWidthGroup: {
    marginBottom: 18,
  },

  allfriendsBtn: {

  },

  closefriendsBtn: {
    marginLeft: 20, 
  },
    


  });