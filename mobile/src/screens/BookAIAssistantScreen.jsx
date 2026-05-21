import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';
import { checkAppointmentConflict } from '../api/appointments';
import { getBranchCity } from '../utils/branch';
import { formatTimeOnly, formatRelativeDate } from '../utils/datetime';
import styles from '../styles/BookAIAssistantScreen';

const BOT_GREETING =
  "I'm ToothConnect, your appointment scheduling assistant for Smile Empress Dental Hub. How can I assist you today?";

const DENTAL_KEYWORDS = [
  'tooth', 'teeth', 'dental', 'dentist', 'cavity', 'caries', 'filling',
  'crown', 'bridge', 'implant', 'extraction', 'extract', 'braces', 'bracket',
  'orthodon', 'retainer', 'aligner', 'cleaning', 'scaling', 'polish', 'prophylaxis',
  'gum', 'gingivit', 'periodon', 'root canal', 'pulp', 'wisdom', 'impacted',
  'toothache', 'tooth ache', 'tooth pain', 'sensitive', 'sensitiv',
  'swollen', 'swelling', 'abscess', 'jaw', 'oral', 'mouth sore', 'mouth pain',
  'whitening', 'whiten', 'veneer', 'denture', 'plaque', 'tartar',
  'checkup', 'check-up', 'check up', 'consultation', 'consult',
  'x-ray', 'xray', 'molar', 'incisor', 'canine', 'premolar', 'enamel', 'fluoride',
  'snap-on', 'snap on', 'bruxism', 'grinding',
];

function isDentalRelated(text) {
  const lower = text.toLowerCase();
  return DENTAL_KEYWORDS.some(kw => lower.includes(kw));
}

const DAYS_OF_WEEK = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

function getTodayClinicDate() {
  const phMs = Date.now() + 8 * 60 * 60 * 1000;
  const d = new Date(phMs);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}

function addDaysToDateKey(dateKey, n) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}-${String(dt.getUTCDate()).padStart(2,'0')}`;
}

function parseConcernDateTime(text) {
  if (!text || !text.trim()) return null;
  const lower = text.toLowerCase();

  let parsedTime = null;
  const ampmMatch = lower.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const min = parseInt(ampmMatch[2] || '0', 10);
    if (ampmMatch[3] === 'pm' && h < 12) h += 12;
    if (ampmMatch[3] === 'am' && h === 12) h = 0;
    if (h >= 10 && h <= 19 && !(h === 19 && min > 0)) {
      parsedTime = `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
    }
  }
  if (!parsedTime) {
    const h24 = lower.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (h24) {
      const h = parseInt(h24[1], 10);
      const min = parseInt(h24[2], 10);
      if (h >= 10 && h <= 19 && !(h === 19 && min > 0)) {
        parsedTime = `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
      }
    }
  }
  if (!parsedTime) return null;

  const today = getTodayClinicDate();
  let parsedDate = null;

  if (/\btoday\b/.test(lower)) {
    parsedDate = today;
  } else if (/\btomorrow\b/.test(lower)) {
    parsedDate = addDaysToDateKey(today, 1);
  } else {
    for (let i = 0; i < DAYS_OF_WEEK.length; i++) {
      if (new RegExp(`\\b(?:this\\s+|next\\s+)?${DAYS_OF_WEEK[i]}\\b`).test(lower)) {
        const [y, m, d] = today.split('-').map(Number);
        const todayDow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
        let diff = i - todayDow;
        if (diff <= 0) diff += 7;
        parsedDate = addDaysToDateKey(today, diff);
        break;
      }
    }
    if (!parsedDate) {
      const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
      if (isoMatch) parsedDate = isoMatch[1];
    }
  }

  if (!parsedDate) return null;
  return { date: parsedDate, time: parsedTime };
}

function buildClinicISO(dateKey, timeKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hour, minute] = timeKey.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, 0, 0)).toISOString();
}

export default function BookAIAssistantScreen({ navigation }) {
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metaError, setMetaError] = useState('');

  const [concern, setConcern] = useState('');
  const [selectedQuick, setSelectedQuick] = useState(null);
  const [inputError, setInputError] = useState('');
  const [nonDentalModal, setNonDentalModal] = useState(false);

  const [conflictChecking, setConflictChecking] = useState(false);
  const [conflictModal, setConflictModal] = useState(false);
  const [conflictSuggestion, setConflictSuggestion] = useState(null);
  const [conflictRequested, setConflictRequested] = useState(null);
  const [conflictExisting, setConflictExisting] = useState(null);

  useEffect(() => {
    loadMeta();
  }, []);

  async function loadMeta() {
    try {
      const res = await api.get('/appointments/_meta/services-and-branches');
      setBranches(res.data.branches);
      setServices(res.data.services);
      if (res.data.branches.length > 0) {
        setSelectedBranch(res.data.branches[0].id);
      }
    } catch (err) {
      setMetaError(err.response?.data?.message || 'Failed to load clinic data.');
    } finally {
      setLoading(false);
    }
  }

  function getFilteredServices() {
    if (!selectedBranch) return services;
    return services.filter(
      s => !s.available_branch_ids || s.available_branch_ids.includes(selectedBranch)
    );
  }

  function handleQuickPick(service) {
    setSelectedQuick(service);
    setConcern('');
    setInputError('');
  }

  function handleConcernChange(text) {
    setConcern(text);
    if (text.trim()) setSelectedQuick(null);
    setInputError('');
  }

  function proceedToAnalysis() {
    const finalConcern = selectedQuick ? selectedQuick.name : concern.trim();
    const branch = branches.find(b => b.id === selectedBranch);
    navigation.navigate('AIAnalysis', {
      concern: finalConcern,
      services: getFilteredServices(),
      branchId: selectedBranch,
      branchName: getBranchCity(branch),
    });
  }

  async function handleContinue() {
    setInputError('');

    if (!selectedBranch) {
      setInputError('Please select a branch.');
      return;
    }

    const finalConcern = selectedQuick ? selectedQuick.name : concern.trim();
    if (!finalConcern) {
      setInputError('Please describe your concern or pick a service.');
      return;
    }

    if (!selectedQuick && !isDentalRelated(finalConcern)) {
      setNonDentalModal(true);
      return;
    }

    if (!selectedQuick && finalConcern.length < 10) {
      setInputError('Please describe your dental concern in more detail.');
      return;
    }

    // Pre-conflict check: runs for both quick picks and text input whenever
    // the concern text contains a recognisable date + time.
    const parsed = parseConcernDateTime(concern);
    if (parsed) {
      setConflictChecking(true);
      try {
        const preferredStart = buildClinicISO(parsed.date, parsed.time);
        const payload = {
          branch_id: selectedBranch,
          requested_start: preferredStart,
          duration_min: selectedQuick?.duration_min || 30,
        };
        if (selectedQuick) payload.service_id = selectedQuick.id;

        const check = await checkAppointmentConflict(payload);
        if (check.conflict) {
          setConflictRequested(parsed);
          setConflictSuggestion(check.next_available || null);
          setConflictExisting(check.existing || null);
          setConflictModal(true);
          return;
        }
      } catch {
        // Check failed — proceed to AI anyway (non-blocking)
      } finally {
        setConflictChecking(false);
      }
    }

    proceedToAnalysis();
  }

  function handleUseConflictSuggestion() {
    setConflictModal(false);
    if (!conflictSuggestion) return;

    const startRaw = conflictSuggestion.start_time; // "YYYY-MM-DD HH:MM:SS" stored as UTC
    const iso = startRaw.replace(' ', 'T') + 'Z';
    const phMs = new Date(iso).getTime() + 8 * 60 * 60 * 1000;
    const phDt = new Date(phMs);
    const sugDate = `${phDt.getUTCFullYear()}-${String(phDt.getUTCMonth()+1).padStart(2,'0')}-${String(phDt.getUTCDate()).padStart(2,'0')}`;
    const sugTime = `${String(phDt.getUTCHours()).padStart(2,'0')}:${String(phDt.getUTCMinutes()).padStart(2,'0')}`;

    const branch = branches.find(b => b.id === selectedBranch);

    if (selectedQuick) {
      // Service already known — skip AI, go directly to slot selection
      navigation.navigate('BookSuggestions', {
        service: {
          id: selectedQuick.id,
          name: selectedQuick.name,
          duration_min: selectedQuick.duration_min || 30,
          price: selectedQuick.price ?? 0,
        },
        branchId: selectedBranch,
        branchName: getBranchCity(branch),
        preferredDate: sugDate,
        preferredTime: sugTime,
      });
    } else {
      // Service unknown (text input) — still need AI to determine service,
      // but override the time so BookSuggestions uses the conflict-free slot
      navigation.navigate('AIAnalysis', {
        concern: concern.trim(),
        services: getFilteredServices(),
        branchId: selectedBranch,
        branchName: getBranchCity(branch),
        overridePreferredDate: sugDate,
        overridePreferredTime: sugTime,
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Booking Assistant</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Bot greeting bubble */}
          <View style={styles.botRow}>
            <View style={styles.botAvatar}>
              <Text style={styles.botAvatarText}>TC</Text>
            </View>
            <View style={styles.botBubble}>
              <Text style={styles.botBubbleText}>{BOT_GREETING}</Text>
            </View>
          </View>

          {metaError ? (
            <Text style={styles.error}>{metaError}</Text>
          ) : loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#c98904" size="small" />
              <Text style={styles.loadingText}>Loading clinic services...</Text>
            </View>
          ) : (
            <>
              {/* Branch selector */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>Select Branch</Text>
                <View style={styles.branchRow}>
                  {branches.map(b => (
                    <TouchableOpacity
                      key={b.id}
                      style={[
                        styles.branchChip,
                        selectedBranch === b.id && styles.branchChipActive,
                      ]}
                      onPress={() => {
                        setSelectedBranch(b.id);
                        setSelectedQuick(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.branchChipText,
                          selectedBranch === b.id && styles.branchChipTextActive,
                        ]}
                      >
                        {getBranchCity(b)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Quick service picks */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionLabel}>Quick Picks</Text>
                <Text style={styles.sectionSub}>
                  Already know what you need? Tap a service directly.
                </Text>
                <View style={styles.chipGrid}>
                  {getFilteredServices().map(s => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.serviceChip,
                        selectedQuick?.id === s.id && styles.serviceChipActive,
                      ]}
                      onPress={() => handleQuickPick(s)}
                    >
                      <Text
                        style={[
                          styles.serviceChipText,
                          selectedQuick?.id === s.id && styles.serviceChipTextActive,
                        ]}
                      >
                        {s.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Sticky input area */}
        <View style={styles.inputArea}>
          <Text style={styles.inputLabel}>
            {selectedQuick
              ? `Selected: ${selectedQuick.name}`
              : 'Describe your dental concern or service request.'}
          </Text>

          {inputError ? <Text style={styles.inputError}>{inputError}</Text> : null}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={concern}
              onChangeText={handleConcernChange}
              placeholder={
                selectedQuick
                  ? 'Tap a different service or type your concern here...'
                  : 'e.g. I have a toothache on my upper left molar'
              }
              placeholderTextColor="#b8b8b8"
              multiline
              maxLength={500}
            />
          </View>
          <Text style={styles.charCounter}>{concern.length}/500</Text>

          <TouchableOpacity
            style={[styles.continueButton, (loading || conflictChecking) && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={loading || conflictChecking}
          >
            {conflictChecking ? (
              <View style={styles.continueButtonRow}>
                <ActivityIndicator color="#ffffff" size="small" style={{ marginRight: 8 }} />
                <Text style={styles.continueButtonText}>Checking availability…</Text>
              </View>
            ) : (
              <Text style={styles.continueButtonText}>Analyze & Continue →</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Conflict modal */}
      <Modal
        visible={conflictModal}
        transparent
        animationType="fade"
        onRequestClose={() => setConflictModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setConflictModal(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <View style={styles.modalIconRow}>
              <View style={styles.modalIcon}>
                <Text style={styles.modalIconText}>TC</Text>
              </View>
            </View>
            <Text style={styles.modalTitle}>Time Not Available</Text>
            <Text style={styles.modalMessage}>
              {conflictExisting
                ? `You already have a ${conflictExisting.service_name} appointment on ${formatRelativeDate(conflictExisting.start_time)} at ${formatTimeOnly(conflictExisting.start_time)}.`
                : conflictRequested
                  ? `${conflictRequested.time.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => {
                      const hr = parseInt(h, 10);
                      return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
                    })} on ${conflictRequested.date} is not available.`
                  : 'Your requested time is not available.'}
              {conflictSuggestion
                ? `\n\nNext available: ${formatTimeOnly(conflictSuggestion.start_time)} · ${formatRelativeDate(conflictSuggestion.start_time)}${conflictSuggestion.dentist_name ? ` with ${conflictSuggestion.dentist_name}` : ''}`
                : '\n\nNo slots were found in that window. Please try a different date.'}
            </Text>
            {conflictSuggestion ? (
              <TouchableOpacity style={styles.modalOkButton} onPress={handleUseConflictSuggestion}>
                <Text style={styles.modalOkButtonText}>Use Suggested Time</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={[styles.modalSecondaryButton, conflictSuggestion && { marginTop: 10 }]}
              onPress={() => setConflictModal(false)}
            >
              <Text style={styles.modalSecondaryButtonText}>Change Input</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={nonDentalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setNonDentalModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setNonDentalModal(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <View style={styles.modalIconRow}>
              <View style={styles.modalIcon}>
                <Text style={styles.modalIconText}>TC</Text>
              </View>
            </View>
            <Text style={styles.modalTitle}>Dental Concerns Only</Text>
            <Text style={styles.modalMessage}>
              I am your appointment scheduling assistant for dental-related concerns. Please state dental-related concerns only.
            </Text>
            <TouchableOpacity
              style={styles.modalOkButton}
              onPress={() => setNonDentalModal(false)}
            >
              <Text style={styles.modalOkButtonText}>OK, I understand</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
