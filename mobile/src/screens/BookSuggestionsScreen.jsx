import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
};

export default function BookSuggestionsScreen({ navigation, route }) {
  const { service, branchId, branchName } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSuggestions();
  }, []);

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
      });
      setData(result);
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
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI suggestions</Text>
      </View>

      <ScrollView style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.contextCard}>
          <Text style={styles.contextLabel}>Service</Text>
          <Text style={styles.contextValue}>
            {service.name} · {service.duration_min} min · ₱{Number(service.price).toFixed(0)}
          </Text>
          <Text style={[styles.contextLabel, { marginTop: 8 }]}>Branch</Text>
          <Text style={styles.contextValue}>{branchName}</Text>
        </View>

        {loading ? (
          <Text style={styles.loading}>Finding your best slots...</Text>
        ) : !data || data.suggestions.length === 0 ? (
          <Text style={styles.empty}>
            No available slots found in the next 14 days.{'\n'}Try a different branch or contact us.
          </Text>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Top {data.suggestions.length} suggestions</Text>
            <Text style={styles.sectionSubtitle}>
              Reviewed {data.total_candidates_considered} possible slots from {data.total_eligible_dentists} dentists.
              Each suggestion shows why it scored well.
            </Text>

            {data.suggestions.map((s, idx) => {
              const isBest = idx === 0;
              return (
                <View
                  key={`${s.dentist_id}-${s.start_time}`}
                  style={[styles.suggestionCard, isBest && styles.suggestionCardBest]}
                >
                  <View style={styles.suggestionTopRow}>
                    <View>
                      <Text style={styles.suggestionTime}>
                        {formatRelativeDate(s.start_time)} · {formatTimeOnly(s.start_time)}
                      </Text>
                    </View>
                    {isBest && (
                      <View style={styles.bestBadge}>
                        <Text style={styles.bestBadgeText}>BEST FIT</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.suggestionDentist}>with {s.dentist_name}</Text>

                  <Text style={styles.breakdownLabel}>Why this slot</Text>
                  {Object.entries(s.breakdown).map(([reason, points]) => (
                    <View key={reason} style={styles.breakdownRow}>
                      <Text style={styles.breakdownReason}>
                        {BREAKDOWN_LABELS[reason] || reason}
                      </Text>
                      <Text style={styles.breakdownPoints}>+{points}</Text>
                    </View>
                  ))}
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Total score</Text>
                    <Text style={styles.scoreValue}>{s.score}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handlePick(s)}
                    style={[styles.pickButton, isBest && styles.pickButtonBest]}
                  >
                    <Text style={styles.pickButtonText}>Pick this slot</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}