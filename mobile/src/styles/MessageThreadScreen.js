import { StyleSheet } from 'react-native';

const GOLD = '#c98b00';
const GOLD_DARK = '#b97b00';
const TEXT = '#171717';
const MUTED = '#6f6f6f';
const LINE = '#eeeeee';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  keyboardArea: {
    flex: 1,
  },

  header: {
    minHeight: 86,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },

  backButton: {
    width: 28,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 4,
  },

  backButtonText: {
    color: GOLD_DARK,
    fontSize: 38,
    lineHeight: 38,
    fontWeight: '500',
  },

  headerAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
    elevation: 4,
  },

  headerAvatarText: {
    color: GOLD_DARK,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'serif',
  },

  headerInfo: {
    flex: 1,
  },

  headerName: {
    color: TEXT,
    fontSize: 21,
    fontWeight: '800',
    fontFamily: 'serif',
  },

  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  headerRole: {
    color: '#0aa33a',
    fontSize: 14,
    fontWeight: '700',
  },

  headerRoleOffline: {
    color: '#8f8f8f',
  },

  messages: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  messagesContent: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
  },

  datePill: {
    alignSelf: 'center',
    backgroundColor: '#fff8eb',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 9,
    marginBottom: 26,
  },

  datePillText: {
    color: GOLD_DARK,
    fontSize: 13,
    fontWeight: '800',
  },

  messageBlock: {
    maxWidth: '82%',
    marginBottom: 20,
  },

  messageBlockSelf: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },

  messageBlockOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },

  bubble: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 18,
  },

  bubbleSelf: {
    backgroundColor: '#fff1cf',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 8,
  },

  bubbleOther: {
    backgroundColor: '#f3f3f3',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 8,
  },

  bubbleTextSelf: {
    color: TEXT,
    fontSize: 15,
    lineHeight: 22,
  },

  bubbleTextOther: {
    color: TEXT,
    fontSize: 15,
    lineHeight: 22,
  },

  bubbleTime: {
    fontSize: 11,
    marginTop: 8,
  },

  bubbleTimeSelf: {
    color: GOLD_DARK,
    textAlign: 'right',
  },

  bubbleTimeOther: {
    color: GOLD_DARK,
    textAlign: 'left',
  },

  composer: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 7,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: LINE,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },

  composerInput: {
    flex: 1,
    minHeight: 35,
    maxHeight: 80,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 15,
    color: TEXT,
    marginRight: 10,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 7,
    elevation: 5,
  },

  sendBtnDisabled: {
    backgroundColor: '#d8b86b',
  },

  sendBtnText: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
    marginLeft: 2,
  },

  empty: {
    color: '#a0a0a0',
    textAlign: 'center',
    padding: 40,
    fontSize: 13,
    fontStyle: 'italic',
  },

  loading: {
    color: MUTED,
    textAlign: 'center',
    padding: 40,
  },

  error: {
    backgroundColor: '#fff1f1',
    color: '#9b2c2c',
    padding: 10,
    borderRadius: 10,
    fontSize: 13,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffd7d7',
  },
});

export default styles;
