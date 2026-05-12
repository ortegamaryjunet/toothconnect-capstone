import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { getTreatmentsByPatient, getConditions } from '../api/treatments';
import { formatDateOnly } from '../utils/datetime';
import styles from '../styles/TreatmentProgressScreen';

export default function TreatmentProgressScreen({ navigation }) {
  const { user } = useAuth();
  const [byTooth, setByTooth] = useState({});
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [tData, conds] = await Promise.all([
        getTreatmentsByPatient(user.id),
        getConditions(),
      ]);
      setByTooth(tData.by_tooth || {});
      setConditions(conds);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load treatments');
    } finally {
      setLoading(false);
    }
  }

  function findCondition(code) {
    return conditions.find(c => c.code === code);
  }

  const toothNumbers = Object.keys(byTooth).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Treatment progress</Text>
      </View>

      <ScrollView style={styles.body}>
        <Text style={styles.intro}>
          Your treatments grouped by tooth. The current condition is shown alongside the full history.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading && <Text style={styles.loading}>Loading...</Text>}

        {!loading && toothNumbers.length === 0 && (
          <Text style={styles.empty}>
            No treatments yet. Your dentist will record treatments here after visits.
          </Text>
        )}

        {!loading && toothNumbers.map(tooth => {
          const history = byTooth[tooth];
          const latest = history[0];
          const currentCond = findCondition(latest.condition_type);
          const accent = currentCond ? currentCond.color : '#cbd5e0';

          return (
            <View
              key={tooth}
              style={[styles.toothSection, { borderLeftColor: accent }]}
            >
              <View style={styles.toothHeader}>
                <Text style={styles.toothNumber}>#{tooth}</Text>
                <Text style={styles.toothCurrent}>
                  Current: {currentCond ? currentCond.label : latest.condition_type}
                </Text>
              </View>

              {history.map(t => {
                const cond = findCondition(t.condition_type);
                return (
                  <View key={t.id} style={styles.historyItem}>
                    <View style={styles.historyTopRow}>
                      <Text style={styles.historyCondition}>
                        {cond ? cond.label : t.condition_type}
                      </Text>
                      <Text style={styles.historyDate}>
                        {formatDateOnly(t.appointment_date)}
                      </Text>
                    </View>
                    <Text style={styles.historyMeta}>
                      {t.dentist_name} · {t.service_name}
                    </Text>
                    {t.notes && (
                      <Text style={styles.historyNotes}>"{t.notes}"</Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}