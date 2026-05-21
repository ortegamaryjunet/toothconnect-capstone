import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7f4',
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

  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // Loading state
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1f1f1f',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Error state
  errorBox: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  errorText: {
    color: '#993c1d',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#c98904',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 14,
  },

  // Patient concern card (dark navy)
  concernCard: {
    backgroundColor: '#1a365d',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  concernLabel: {
    fontSize: 10,
    color: '#90aecb',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '800',
    marginBottom: 6,
  },
  concernText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },

  // AI analysis results card
  analysisCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4cf88',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
  },
  analysisTitle: {
    fontSize: 10,
    color: '#8a650e',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '900',
    marginBottom: 10,
  },
  interpretedText: {
    fontSize: 14,
    color: '#1f1f1f',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 16,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#f0e4b8',
    marginBottom: 14,
  },

  // Info rows (label + value)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '700',
    minWidth: 130,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f1f1f',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },

  // Urgency badge
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  urgencyBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  // Confidence bar — separate block below label
  confidenceRow: {
    marginBottom: 12,
  },
  confidenceArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0e8d8',
    borderRadius: 999,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 999,
  },
  confidenceScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1f1f1f',
    minWidth: 36,
    textAlign: 'right',
  },

  // Safety note
  safetyNote: {
    backgroundColor: '#fff8e6',
    borderWidth: 1,
    borderColor: '#f0d070',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  safetyNoteText: {
    fontSize: 13,
    color: '#7d4e07',
    fontWeight: '600',
    lineHeight: 19,
  },

  // Needs staff review note
  reviewNote: {
    backgroundColor: '#f0f4ff',
    borderWidth: 1,
    borderColor: '#b8c8e8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  reviewNoteText: {
    fontSize: 13,
    color: '#1a3a6e',
    fontWeight: '600',
    lineHeight: 19,
  },

  // Disclaimer
  disclaimer: {
    fontSize: 11,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 20,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },

  // Action buttons
  bookButton: {
    backgroundColor: '#c98904',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  chooseButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#c88a11',
  },
  chooseButtonText: {
    color: '#b47a00',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default styles;
