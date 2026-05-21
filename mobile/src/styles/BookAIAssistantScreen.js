import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7f4',
  },
  flex: {
    flex: 1,
  },

  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.2,
    borderBottomColor: '#c88a11',
    paddingHorizontal: 18,
    backgroundColor: '#ffffff',
  },
  backButton: {
    marginRight: 12,
    paddingVertical: 6,
    paddingRight: 4,
  },
  backButtonText: {
    color: '#b47a00',
    fontSize: 14,
    fontWeight: '800',
  },
  headerTitle: {
    color: '#1f1f1f',
    fontSize: 20,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
  },

  // Bot greeting bubble
  botRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 10,
  },
  botAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a365d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botAvatarText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  botBubble: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4cf88',
    borderRadius: 14,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#c88a11',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  botBubbleText: {
    color: '#1f1f1f',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },

  // Loading / error in chat area
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingLeft: 4,
  },
  loadingText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    backgroundColor: '#fff3f0',
    color: '#993c1d',
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0c6b8',
    fontWeight: '600',
  },

  // Section cards
  sectionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4cf88',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    color: '#8a650e',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '800',
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
    marginBottom: 10,
    lineHeight: 18,
  },

  // Branch chips
  branchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  branchChip: {
    backgroundColor: '#f8f7f4',
    borderWidth: 1,
    borderColor: '#e4cf88',
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 999,
  },
  branchChipActive: {
    backgroundColor: '#c98904',
    borderColor: '#c98904',
  },
  branchChipText: {
    fontSize: 12,
    color: '#8a650e',
    fontWeight: '800',
  },
  branchChipTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },

  // Service quick-pick chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    backgroundColor: '#f8f7f4',
    borderWidth: 1,
    borderColor: '#d4b870',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  serviceChipActive: {
    backgroundColor: '#1a365d',
    borderColor: '#1a365d',
  },
  serviceChipText: {
    fontSize: 12,
    color: '#5a4a1e',
    fontWeight: '700',
  },
  serviceChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // Bottom input area
  inputArea: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1.2,
    borderTopColor: '#e4cf88',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 10 : 14,
  },
  inputLabel: {
    fontSize: 12,
    color: '#8a650e',
    fontWeight: '700',
    marginBottom: 6,
  },
  inputError: {
    color: '#993c1d',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputRow: {
    borderWidth: 1.2,
    borderColor: '#c88a11',
    borderRadius: 10,
    backgroundColor: '#fdfaf2',
    marginBottom: 10,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f1f1f',
    minHeight: 56,
    maxHeight: 100,
    fontWeight: '500',
  },
  charCounter: {
    fontSize: 11,
    color: '#aaaaaa',
    textAlign: 'right',
    marginBottom: 10,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#c98904',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  continueButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: '#c88a11',
    width: '100%',
  },
  modalIconRow: {
    marginBottom: 14,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a365d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalTitle: {
    color: '#1f1f1f',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  modalMessage: {
    color: '#555555',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 22,
  },
  modalOkButton: {
    backgroundColor: '#c98904',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalOkButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  modalSecondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.2,
    borderColor: '#c88a11',
  },
  modalSecondaryButtonText: {
    color: '#8a650e',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default styles;
