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
import { suggestSlots } from '../api/appointments';

const BREAKDOWN_LABELS = {
  matches_preferred_time_of_day: 'Matches your preferred time of day',
  same_dentist_as_last_visit: 'Same dentist as your last visit',
  soonest_available_day: 'Soonest available day',
  next_day_bonus: 'Next-day option',
  earlier_in_day: 'Earlier in the day',
  close_to_requested_time: 'Close to your requested date and time',
};

const HOUR_OPTIONS = Array.from({ length: 10 }, (_, index) => 10 + index);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index);

export default function BookSuggestionsScreen({ navigation, route }) {
  const { service, branchId, branchName, rescheduleAppointmentId, preferredDate: aiDate, preferredTime: aiTime } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPreferredSearch, setShowPreferredSearch] = useState(false);
  const [preferredDate, setPreferredDate] = useState(aiDate || getDefaultPreferredDate());
  const [preferredTime, setPreferredTime] = useState(aiTime || '10:00');
  const [preferredLoading, setPreferredLoading] = useState(false);
  const [suggestionMode, setSuggestionMode] = useState('earliest');
  const [pickerMode, setPickerMode] = useState(null);
  const [selectedSlotBooked, setSelectedSlotBooked] = useState(false);

  useEffect(() => {
    if (aiDate || aiTime) {
      loadInitialSlotsWithPreference();
    } else {
      loadSuggestions();
    }
  }, []);

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
        try {
          const preferredStart = buildClinicISO(date, time);
          const preferred = new Date(preferredStart);
          const from = new Date(preferred);
          from.setDate(preferred.getDate() - 3);
          const to = new Date(preferred);
          to.setDate(preferred.getDate() + 14);

          const result = await suggestSlots({
            branch_id: branchId,
            service_id: service.id,
            from: from.toISOString(),
            to: to.toISOString(),
            preferred_start: preferredStart,
            limit: 3,
          });
          setData(result);
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

  async function loadSuggestions() {
    setLoading(true);
    setError('');
    try {
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + 14);

      const result = await suggestSlots({
        branch_id: branchId,
        service_id: service.id,
        from: now.toISOString(),
        to: future.toISOString(),
        limit: 3,
      });
      setData(result);
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
      service,
      branchId,
      branchName,
      suggestion,
      rescheduleAppointmentId: rescheduleAppointmentId || null,
    });
  }

  async function handlePreferredSearch() {
    setPreferredLoading(true);
    setError('');

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
      const preferred = new Date(preferredStart);
      const from = new Date(preferred);
      from.setDate(preferred.getDate() - 3);
      const to = new Date(preferred);
      to.setDate(preferred.getDate() + 14);

      const result = await suggestSlots({
        branch_id: branchId,
        service_id: service.id,
        from: from.toISOString(),
        to: to.toISOString(),
        preferred_start: preferredStart,
        limit: 3,
      });

      setData(result);
      setSuggestionMode('preferred');
      setSelectedSlotBooked(Boolean(result.selected_slot_booked));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load preferred slots');
    } finally {
      setPreferredLoading(false);
    }
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

        <View style={styles.contextCard}>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Branch</Text>
            <Text style={styles.contextValue}>{branchName}</Text>
          </View>

          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Service</Text>
            <Text style={styles.contextValue}>{service.name}</Text>
          </View>

          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>Duration</Text>
            <Text style={styles.contextValue}>{service.duration_min} min</Text>
          </View>
        </View>

        {loading ? (
          <Text style={styles.loading}>Finding your best slots...</Text>
        ) : !data || data.suggestions.length === 0 ? (
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

            {data.suggestions.map((s, idx) => {
              const isBest = idx === 0;
              return (
                <View
                  key={`${s.dentist_id}-${s.start_time}`}
                  style={[styles.suggestionCard, isBest && styles.suggestionCardBest]}
                >
                  <View style={styles.suggestionTopRow}>
                    <View style={styles.suggestionMainInfo}>
                      {isBest && (
                        <View style={styles.bestBadge}>
                          <Text style={styles.bestBadgeText}>BEST MATCH</Text>
                        </View>
                      )}

                      <Text style={styles.suggestionDate}>
                        {formatRelativeDate(s.start_time)}
                      </Text>

                      <Text style={styles.suggestionTime}>
                        {formatTimeOnly(s.start_time)}
                      </Text>

                      <Text style={styles.suggestionDentist}>Dr. {s.dentist_name}</Text>
                    </View>

                  </View>

                  <View style={styles.breakdownPanel}>
                    {Object.entries(s.breakdown).map(([reason]) => (
                      <View key={reason} style={styles.breakdownRow}>
                        <Text style={styles.breakdownReason}>
                          {BREAKDOWN_LABELS[reason] || reason}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={() => handlePick(s)}
                    style={[styles.pickButton, isBest && styles.pickButtonBest]}
                  >
                    <Text style={[styles.pickButtonText, isBest && styles.pickButtonTextBest]}>
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
    </SafeAreaView>
  );
}

function getDefaultPreferredDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toDateKey(tomorrow);
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
