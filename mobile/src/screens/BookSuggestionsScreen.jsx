import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatTimeOnly, formatRelativeDate } from '../utils/datetime';
import styles from '../styles/BookSuggestionsScreen';
import { getAppointmentMeta, suggestSlots } from '../api/appointments';
import { listPatientDentists } from '../api/patients';

const HOUR_OPTIONS = Array.from({ length: 10 }, (_, index) => 10 + index);
const MINUTE_OPTIONS = [0, 30];

function formatDentistName(name) {
  if (!name) return '';
  const cleaned = String(name).trim().replace(/^(Dr\.\s*)+/i, '');
  return `Dr. ${cleaned}`;
}

function getSuggestionDentists(suggestion) {
  if (Array.isArray(suggestion?.dentists) && suggestion.dentists.length > 0) {
    return suggestion.dentists;
  }

  if (suggestion?.dentist_id) {
    return [{
      dentist_id: suggestion.dentist_id,
      dentist_name: suggestion.dentist_name,
    }];
  }

  return [];
}

function normalizeSuggestionTime(value) {
  if (!value) return null;
  if (typeof value === 'string' && !value.includes('T')) {
    return value.replace(' ', 'T') + 'Z';
  }
  return value;
}

function isReceptionistSlotStart(value) {
  const normalized = normalizeSuggestionTime(value);
  if (!normalized) return false;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return false;
  const minutes = date.getMinutes();
  return minutes === 0 || minutes === 30;
}

function suggestionIncludesDentist(suggestion, dentistId) {
  if (!dentistId) return true;

  return getSuggestionDentists(suggestion).some(
    (dentist) => String(dentist.dentist_id) === String(dentistId)
  );
}

function getDisplaySuggestions(suggestions = [], selectedDentistId = '') {
  return suggestions
    .filter((suggestion) => isReceptionistSlotStart(suggestion.start_time))
    .filter((suggestion) => suggestionIncludesDentist(suggestion, selectedDentistId))
    .slice(0, 3);
}

function mergeDentists(primary = [], fallback = []) {
  const map = new Map();

  for (const dentist of [...primary, ...fallback]) {
    const id = dentist?.dentist_id ?? dentist?.id;
    const name = dentist?.dentist_name ?? dentist?.name;
    if (!id || map.has(String(id))) continue;

    map.set(String(id), {
      dentist_id: id,
      dentist_name: name,
    });
  }

  return Array.from(map.values()).sort((a, b) =>
    String(a.dentist_name || '').localeCompare(String(b.dentist_name || ''))
  );
}

function dentistMatchesService(dentist, service) {
  const serviceIds = Array.isArray(dentist.service_ids) ? dentist.service_ids : [];
  if (serviceIds.some((id) => String(id) === String(service?.id))) return true;

  const serviceText = String(dentist.services || '').toLowerCase();
  return !serviceText || serviceText.includes(String(service?.name || '').toLowerCase());
}

function dentistMatchesBranch(dentist, branchId, branchName) {
  const branchIds = Array.isArray(dentist.branch_ids) ? dentist.branch_ids : [];
  if (branchIds.some((id) => String(id) === String(branchId))) return true;

  if (dentist.home_branch_id && String(dentist.home_branch_id) === String(branchId)) return true;

  const dentistBranchText = `${dentist.branch_name || ''} ${dentist.branch_address || ''}`.toLowerCase();
  return dentistBranchText.includes(String(branchName || '').toLowerCase());
}

function mapDentistOptions(dentists) {
  return dentists.map((dentist) => ({
    dentist_id: dentist.id,
    dentist_name: dentist.name,
  }));
}

function buildFallbackDentistOptions(dentists, service, branchId, branchName) {
  const serviceMatches = dentists.filter((dentist) => dentistMatchesService(dentist, service));
  const branchMatches = serviceMatches.filter((dentist) =>
    dentistMatchesBranch(dentist, branchId, branchName)
  );

  if (branchMatches.length > 0) return mapDentistOptions(branchMatches);
  if (serviceMatches.length > 0) return mapDentistOptions(serviceMatches);
  return mapDentistOptions(dentists);
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function findServiceByName(services, serviceName) {
  const target = normalizeText(serviceName);
  if (!target) return null;

  return services.find((candidate) => normalizeText(candidate.name) === target) ||
    services.find((candidate) => normalizeText(candidate.name).includes(target)) ||
    services.find((candidate) => target.includes(normalizeText(candidate.name)));
}

function filterSlotResultFrom(result, minStartISO) {
  if (!Array.isArray(result?.suggestions) || !minStartISO) return result;

  const minTime = new Date(minStartISO).getTime();
  if (Number.isNaN(minTime)) return result;

  return {
    ...result,
    suggestions: result.suggestions.filter((suggestion) => {
      const suggestionTime = new Date(normalizeSuggestionTime(suggestion.start_time)).getTime();
      return !Number.isNaN(suggestionTime) && suggestionTime >= minTime;
    }),
  };
}

export default function BookSuggestionsScreen({ navigation, route }) {
  const { service, branchId, branchName, rescheduleAppointmentId, preferredDate: aiDate, preferredTime: aiTime } = route.params;
  const [resolvedService, setResolvedService] = useState(service);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showPreferredSearch, setShowPreferredSearch] = useState(false);
  const [preferredDate, setPreferredDate] = useState(aiDate || getDefaultPreferredDate());
  const [preferredTime, setPreferredTime] = useState(aiTime || '10:00');
  const [preferredLoading, setPreferredLoading] = useState(false);
  const [suggestionMode, setSuggestionMode] = useState('earliest');
  const [pickerMode, setPickerMode] = useState(null);
  const [selectedSlotBooked, setSelectedSlotBooked] = useState(false);
  const [selectedDentistId, setSelectedDentistId] = useState('');
  const [dentistPickerOpen, setDentistPickerOpen] = useState(false);
  const [metaDentists, setMetaDentists] = useState([]);

  const dentistOptions = mergeDentists(
    Array.isArray(data?.eligible_dentists)
    ? data.eligible_dentists
      : [],
    metaDentists
  );
  const displaySuggestions = getDisplaySuggestions(data?.suggestions || [], selectedDentistId);

  const selectedDentist = dentistOptions.find(
    (dentist) => String(dentist.dentist_id) === String(selectedDentistId)
  );
  const displayService = resolvedService || service;

  useEffect(() => {
    loadDentistOptions();

    if (aiDate || aiTime) {
      loadInitialSlotsWithPreference();
    } else {
      loadSuggestions();
    }
  }, []);

  async function resolveServiceForSlots() {
    if (resolvedService?.id) return resolvedService;
    if (service?.id) return service;

    const meta = await getAppointmentMeta();
    const services = Array.isArray(meta?.services) ? meta.services : [];
    const matched = findServiceByName(services, service?.name);

    if (matched?.id) {
      const nextService = {
        ...service,
        ...matched,
        duration_min: matched.duration_min || service?.duration_min || 30,
      };
      setResolvedService(nextService);
      return nextService;
    }

    return service;
  }

  async function requestSlotSuggestions(payload, { allowDentistFallback = true } = {}) {
    const result = await suggestSlots(payload);
    const hasSuggestions = Array.isArray(result?.suggestions) && result.suggestions.length > 0;

    if (!hasSuggestions && allowDentistFallback && payload.dentist_id) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.dentist_id;
      const fallbackResult = await suggestSlots(fallbackPayload);
      const fallbackHasSuggestions =
        Array.isArray(fallbackResult?.suggestions) && fallbackResult.suggestions.length > 0;

      if (fallbackHasSuggestions) {
        setSelectedDentistId('');
        setNotice('The selected dentist has no close slots, so we showed all available dentists instead.');
        return fallbackResult;
      }
    }

    return result;
  }

  async function loadDentistOptions() {
    try {
      const meta = await getAppointmentMeta();
      const dentists = Array.isArray(meta?.dentists) ? meta.dentists : [];
      const services = Array.isArray(meta?.services) ? meta.services : [];
      const serviceForFilter = service?.id ? service : findServiceByName(services, service?.name) || service;
      if (!service?.id && serviceForFilter?.id) setResolvedService(serviceForFilter);
      const filtered = dentists
        .filter((dentist) => {
          const serviceIds = Array.isArray(dentist.service_ids) ? dentist.service_ids : [];
          const branchIds = Array.isArray(dentist.branch_ids) ? dentist.branch_ids : [];

          return serviceIds.some((id) => String(id) === String(serviceForFilter.id)) &&
            branchIds.some((id) => String(id) === String(branchId));
        })
        .map((dentist) => ({
          dentist_id: dentist.id,
          dentist_name: dentist.name,
        }));

      if (filtered.length > 0) {
        setMetaDentists(filtered);
        return;
      }

      const patientDentists = await listPatientDentists();
      setMetaDentists(buildFallbackDentistOptions(patientDentists, serviceForFilter, branchId, branchName));
    } catch (_) {
      try {
        const patientDentists = await listPatientDentists();
        setMetaDentists(buildFallbackDentistOptions(patientDentists, resolvedService || service, branchId, branchName));
      } catch {
        setMetaDentists([]);
      }
    }
  }

  async function loadInitialSlotsWithPreference() {
    const date = aiDate || getDefaultPreferredDate();
    const time = aiTime || '10:00';

    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    const validTime = /^\d{2}:\d{2}$/.test(time);

    if (validDate && validTime) {
      const [h, m] = time.split(':').map(Number);
      const inRange = h >= 10 && (h < 19 || (h === 19 && m === 0));
      if (inRange) {
        setLoading(true);
        setError('');
        setNotice('');
        try {
          const serviceForRequest = await resolveServiceForSlots();
          if (!serviceForRequest?.id) {
            setError('Please choose the service again so we can find available slots.');
            setLoading(false);
            return;
          }

          const preferredStart = buildClinicISO(date, time);
          const preferred = new Date(preferredStart);
          const from = new Date(preferred);
          const to = new Date(preferred);
          to.setDate(preferred.getDate() + 14);

          const payload = {
            branch_id: branchId,
            service_id: serviceForRequest.id,
            from: from.toISOString(),
            to: to.toISOString(),
            preferred_start: preferredStart,
            ...(selectedDentistId ? { dentist_id: Number(selectedDentistId) } : {}),
            limit: 8,
          };

          let result;
          try {
            result = await requestSlotSuggestions(payload);
          } catch (err) {
            if (!payload.dentist_id) throw err;
            const retryPayload = { ...payload };
            delete retryPayload.dentist_id;
            result = await suggestSlots(retryPayload);
            setSelectedDentistId('');
            setNotice('The selected dentist could not be checked, so we showed all available dentists instead.');
          }
          setData(filterSlotResultFrom(result, preferredStart));
          setSuggestionMode('preferred');
          setSelectedSlotBooked(Boolean(result.selected_slot_booked));
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load suggestions');
        } finally {
          setLoading(false);
        }
        return;
      }
    }

    loadSuggestions();
  }

  async function loadSuggestions(dentistId = selectedDentistId) {
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const serviceForRequest = await resolveServiceForSlots();
      if (!serviceForRequest?.id) {
        setError('Please choose the service again so we can find available slots.');
        return;
      }

      const searchStart = getEarliestSearchStart();
      const future = new Date();
      future.setDate(searchStart.getDate() + 14);

      const payload = {
        branch_id: branchId,
        service_id: serviceForRequest.id,
        from: searchStart.toISOString(),
        to: future.toISOString(),
        ...(dentistId ? { dentist_id: Number(dentistId) } : {}),
        limit: 8,
      };

      let result;
      try {
        result = await requestSlotSuggestions(payload);
      } catch (err) {
        if (!payload.dentist_id) throw err;
        const retryPayload = { ...payload };
        delete retryPayload.dentist_id;
        result = await suggestSlots(retryPayload);
        setSelectedDentistId('');
        setNotice('The selected dentist could not be checked, so we showed all available dentists instead.');
      }
      setData(filterSlotResultFrom(result, searchStart.toISOString()));
      setSuggestionMode('earliest');
      setSelectedSlotBooked(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  }

  function handlePick(suggestion) {
    navigation.navigate('BookConfirm', {
      service: resolvedService || service,
      branchId,
      branchName,
      suggestion,
      rescheduleAppointmentId: rescheduleAppointmentId || null,
    });
  }

  async function handlePreferredSearch() {
    setPreferredLoading(true);
    setError('');
    setNotice('');

    try {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
        setError('Enter preferred date as YYYY-MM-DD.');
        return;
      }

      if (!/^\d{2}:\d{2}$/.test(preferredTime)) {
        setError('Enter preferred time as HH:MM.');
        return;
      }

      const [hourPart, minutePart] = preferredTime.split(':').map(Number);
      if (
        hourPart < 10 ||
        hourPart > 19 ||
        minutePart < 0 ||
        minutePart > 59 ||
        (hourPart === 19 && minutePart > 0)
      ) {
        setError('Preferred time must be between 10:00 AM and 7:00 PM.');
        return;
      }

      const preferredStart = buildClinicISO(preferredDate, preferredTime);
      const serviceForRequest = await resolveServiceForSlots();
      if (!serviceForRequest?.id) {
        setError('Please choose the service again so we can find available slots.');
        return;
      }

      const preferred = new Date(preferredStart);
      const from = new Date(preferred);
      const to = new Date(preferred);
      to.setDate(preferred.getDate() + 14);

      const payload = {
        branch_id: branchId,
        service_id: serviceForRequest.id,
        from: from.toISOString(),
        to: to.toISOString(),
        preferred_start: preferredStart,
        ...(selectedDentistId ? { dentist_id: Number(selectedDentistId) } : {}),
        limit: 8,
      };

      let result;
      try {
        result = await requestSlotSuggestions(payload);
      } catch (err) {
        if (!payload.dentist_id) throw err;
        const retryPayload = { ...payload };
        delete retryPayload.dentist_id;
        result = await suggestSlots(retryPayload);
        setSelectedDentistId('');
        setNotice('The selected dentist could not be checked, so we showed all available dentists instead.');
      }

      setData(filterSlotResultFrom(result, preferredStart));
      setSuggestionMode('preferred');
      setSelectedSlotBooked(Boolean(result.selected_slot_booked));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load preferred slots');
    } finally {
      setPreferredLoading(false);
    }
  }

  function handleSelectDentist(dentistId) {
    const nextDentistId = dentistId ? String(dentistId) : '';
    setSelectedDentistId(nextDentistId);
    setDentistPickerOpen(false);
    loadSuggestions(nextDentistId);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suggested Appointment Slots</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <View style={styles.contextCard}>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Branch</Text>
            <Text style={styles.contextValue}>{branchName}</Text>
          </View>

          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Service</Text>
            <Text style={styles.contextValue}>{displayService.name}</Text>
          </View>

          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Duration</Text>
            <Text style={styles.contextValue}>{displayService.duration_min || 30} min</Text>
          </View>

          <View style={styles.contextDivider} />

          <View style={styles.dentistPickerGroup}>
            <Text style={styles.contextLabel}>Preferred Dentist</Text>
            <TouchableOpacity
              style={styles.dentistPickerButton}
              onPress={() => setDentistPickerOpen(true)}
              disabled={loading && dentistOptions.length === 0}
            >
              <Text style={styles.dentistPickerText}>
                {selectedDentist
                  ? formatDentistName(selectedDentist.dentist_name)
                  : 'Any available dentist'}
              </Text>
              <Text style={styles.dentistPickerChevron}>v</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <Text style={styles.loading}>Finding your best slots...</Text>
        ) : !data || displaySuggestions.length === 0 ? (
          <>
            <Text style={styles.empty}>
              No available slots found in this range.{'\n'}Try a preferred date and time.
            </Text>

            <TouchableOpacity
              style={styles.moreSlotsButton}
              onPress={() => setShowPreferredSearch((current) => !current)}
            >
              <Text style={styles.moreSlotsText}>View more available slots</Text>
            </TouchableOpacity>

            {showPreferredSearch && (
              <PreferredSlotCard
                preferredDate={preferredDate}
                preferredTime={preferredTime}
                preferredLoading={preferredLoading}
                selectedSlotBooked={selectedSlotBooked}
                aiPrefilled={Boolean(aiDate || aiTime)}
                onOpenDatePicker={() => setPickerMode('date')}
                onOpenTimePicker={() => setPickerMode('time')}
                onSearch={handlePreferredSearch}
              />
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {suggestionMode === 'preferred' ? 'Slots close to your preferred time' : 'Earliest available slots'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {suggestionMode === 'preferred'
                ? 'If your exact date and time is free, it appears first.'
                : 'Within clinic hours, 10:00 AM to 7:00 PM.'}
            </Text>

            {displaySuggestions.map((s) => {
              const availableDentists = getSuggestionDentists(s);
              return (
                <View
                  key={s.start_time}
                  style={styles.suggestionCard}
                >
                  <View style={styles.suggestionTopRow}>
                    <View style={styles.suggestionMainInfo}>
                      <Text style={styles.suggestionDate}>
                        {formatRelativeDate(s.start_time)}
                      </Text>

                      <Text style={styles.suggestionTime}>
                        {formatTimeOnly(s.start_time)}
                      </Text>

                      <Text style={styles.suggestionDentist}>
                        {availableDentists.length === 1
                          ? formatDentistName(availableDentists[0].dentist_name)
                          : `${availableDentists.length} dentists available`}
                      </Text>
                    </View>

                  </View>

                  {availableDentists.length > 1 && (
                    <View style={styles.dentistList}>
                      {availableDentists.map((dentist) => (
                        <Text key={dentist.dentist_id} style={styles.dentistListItem}>
                          {formatDentistName(dentist.dentist_name)}
                        </Text>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => handlePick(s)}
                    style={[styles.pickButton, styles.pickButtonBest]}
                  >
                    <Text style={[styles.pickButtonText, styles.pickButtonTextBest]}>
                      Pick this slot
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.moreSlotsButton}
              onPress={() => setShowPreferredSearch((current) => !current)}
            >
              <Text style={styles.moreSlotsText}>View more available slots</Text>
            </TouchableOpacity>

            {showPreferredSearch && (
              <PreferredSlotCard
                preferredDate={preferredDate}
                preferredTime={preferredTime}
                preferredLoading={preferredLoading}
                selectedSlotBooked={selectedSlotBooked}
                aiPrefilled={Boolean(aiDate || aiTime)}
                onOpenDatePicker={() => setPickerMode('date')}
                onOpenTimePicker={() => setPickerMode('time')}
                onSearch={handlePreferredSearch}
              />
            )}
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerModal
        mode={pickerMode}
        selectedDate={preferredDate}
        selectedTime={preferredTime}
        onClose={() => setPickerMode(null)}
        onSelectDate={(value) => {
          setPreferredDate(value);
          setSelectedSlotBooked(false);
          setPickerMode(null);
        }}
        onSelectTime={(value) => {
          setPreferredTime(value);
          setSelectedSlotBooked(false);
          setPickerMode(null);
        }}
      />

      <DentistPickerModal
        visible={dentistPickerOpen}
        dentists={dentistOptions}
        selectedDentistId={selectedDentistId}
        onClose={() => setDentistPickerOpen(false)}
        onSelect={handleSelectDentist}
      />
    </SafeAreaView>
  );
}

function DentistPickerModal({
  visible,
  dentists,
  selectedDentistId,
  onClose,
  onSelect,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <Pressable style={styles.pickerSheet} onPress={() => {}}>
          <View style={styles.pickerHandle} />
          <Text style={styles.pickerTitle}>Choose dentist</Text>

          <TouchableOpacity
            style={[
              styles.dentistOption,
              !selectedDentistId && styles.dentistOptionSelected,
            ]}
            onPress={() => onSelect('')}
          >
            <Text
              style={[
                styles.dentistOptionText,
                !selectedDentistId && styles.dentistOptionTextSelected,
              ]}
            >
              Any available dentist
            </Text>
          </TouchableOpacity>

          {dentists.map((dentist) => {
            const isSelected = String(dentist.dentist_id) === String(selectedDentistId);

            return (
              <TouchableOpacity
                key={dentist.dentist_id}
                style={[
                  styles.dentistOption,
                  isSelected && styles.dentistOptionSelected,
                ]}
                onPress={() => onSelect(dentist.dentist_id)}
              >
                <Text
                  style={[
                    styles.dentistOptionText,
                    isSelected && styles.dentistOptionTextSelected,
                  ]}
                >
                  {formatDentistName(dentist.dentist_name)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function getDefaultPreferredDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateKey(tomorrow);
}

function getEarliestSearchStart() {
  const now = new Date();
  const clinicParts = getClinicDateParts(now);

  if (clinicParts.hour < 10) {
    return new Date(buildClinicISO(clinicParts.dateKey, '10:00'));
  }

  if (clinicParts.hour >= 19) {
    return new Date(buildClinicISO(addDaysToDateKey(clinicParts.dateKey, 1), '10:00'));
  }

  return now;
}

function getClinicDateParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const value = (type) => parts.find((part) => part.type === type)?.value || '';
  const hourText = value('hour');
  const hour = hourText === '24' ? 0 : Number(hourText);

  return {
    dateKey: `${value('year')}-${value('month')}-${value('day')}`,
    hour,
    minute: Number(value('minute')),
  };
}

function addDaysToDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 0, 0, 0, 0));
  return toDateKey(date);
}

function PreferredSlotCard({
  preferredDate,
  preferredTime,
  preferredLoading,
  selectedSlotBooked,
  aiPrefilled,
  onOpenDatePicker,
  onOpenTimePicker,
  onSearch,
}) {
  return (
    <View style={styles.preferredCard}>
      <Text style={styles.preferredTitle}>Preferred date and time</Text>
      {aiPrefilled ? (
        <Text style={styles.preferredSub}>
          We detected a time preference from your concern. Adjust if needed, then search.
        </Text>
      ) : (
        <Text style={styles.preferredSub}>
          Choose a target slot. We will return the closest three available options.
        </Text>
      )}

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date</Text>
          <TouchableOpacity style={styles.pickerField} onPress={onOpenDatePicker}>
            <Text style={styles.pickerFieldText}>{formatDateLabel(preferredDate)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Time</Text>
          <TouchableOpacity style={styles.pickerField} onPress={onOpenTimePicker}>
            <Text style={styles.pickerFieldText}>{formatTimeLabel(preferredTime)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedSlotBooked && (
        <Text style={styles.slotStatusText}>
          This date and time already has a booked appointment.
        </Text>
      )}

      <TouchableOpacity
        style={[styles.searchSlotsButton, preferredLoading && styles.searchSlotsButtonDisabled]}
        onPress={onSearch}
        disabled={preferredLoading}
      >
        <Text style={styles.searchSlotsButtonText}>
          {preferredLoading ? 'Finding slots...' : 'Suggest 3 close slots'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function PickerModal({
  mode,
  selectedDate,
  selectedTime,
  onClose,
  onSelectDate,
  onSelectTime,
}) {
  const calendarWeeks = buildCalendarWeeks(selectedDate);
  const [draftTime, setDraftTime] = useState(selectedTime);
  const [draftHour, draftMinute] = draftTime.split(':').map(Number);
  const minuteOptions = draftHour === 19 ? [0] : MINUTE_OPTIONS;

  useEffect(() => {
    if (mode === 'time') {
      setDraftTime(selectedTime);
    }
  }, [mode, selectedTime]);

  return (
    <Modal visible={Boolean(mode)} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <Pressable style={styles.pickerSheet} onPress={() => {}}>
          <View style={styles.pickerHandle} />
          <Text style={styles.pickerTitle}>
            {mode === 'date' ? 'Choose preferred date' : 'Choose preferred time'}
          </Text>

          {mode === 'date' && (
            <View>
              <View style={styles.calendarHeaderRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Text key={day} style={styles.calendarWeekday}>{day}</Text>
                ))}
              </View>

              {calendarWeeks.map((week, weekIndex) => (
                <View key={`week-${weekIndex}`} style={styles.calendarWeekRow}>
                  {week.map((option, cellIndex) => (
                    option ? (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.calendarDay,
                          selectedDate === option.value && styles.calendarDaySelected,
                        ]}
                        onPress={() => onSelectDate(option.value)}
                      >
                        <Text
                          style={[
                            styles.calendarDayText,
                            selectedDate === option.value && styles.calendarDayTextSelected,
                          ]}
                        >
                          {option.day}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View key={`empty-${weekIndex}-${cellIndex}`} style={styles.calendarDayEmpty} />
                    )
                  ))}
                </View>
              ))}
            </View>
          )}

          {mode === 'time' && (
            <View>
              <View style={styles.timePickerRow}>
                <ScrollView style={styles.timePickerColumn} showsVerticalScrollIndicator={false}>
                  {HOUR_OPTIONS.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timePickerOption,
                        draftHour === hour && styles.timePickerOptionSelected,
                      ]}
                      onPress={() => {
                        const minute = hour === 19 ? 0 : draftMinute;
                        setDraftTime(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
                      }}
                    >
                      <Text
                        style={[
                          styles.timePickerOptionText,
                          draftHour === hour && styles.timePickerOptionTextSelected,
                        ]}
                      >
                        {formatHourLabel(hour)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <ScrollView style={styles.timePickerColumn} showsVerticalScrollIndicator={false}>
                  {minuteOptions.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.timePickerOption,
                        draftMinute === minute && styles.timePickerOptionSelected,
                      ]}
                      onPress={() => setDraftTime(`${String(draftHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)}
                    >
                      <Text
                        style={[
                          styles.timePickerOptionText,
                          draftMinute === minute && styles.timePickerOptionTextSelected,
                        ]}
                      >
                        {String(minute).padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.timePickerDone}
                onPress={() => onSelectTime(draftTime)}
              >
                <Text style={styles.timePickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function buildCalendarWeeks(selectedDate) {
  const base = new Date(`${selectedDate}T00:00:00`);
  const firstDay = new Date(base.getFullYear(), base.getMonth(), 1);
  const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weeks = [];
  let week = Array(firstDay.getDay()).fill(null);

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(base.getFullYear(), base.getMonth(), day);
    date.setHours(0, 0, 0, 0);

    if (date >= today) {
      week.push({ day, value: toDateKey(date) });
    } else {
      week.push(null);
    }

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  return weeks;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatHourLabel(hour) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString('en-PH', {
    hour: 'numeric',
    hour12: true,
  });
}

function formatDateLabel(value) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeLabel(value) {
  const [hourPart, minutePart] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hourPart, minutePart, 0, 0);
  return date.toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function buildClinicISO(dateValue, timeValue) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hour, minute] = timeValue.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, 0, 0)).toISOString();
}
