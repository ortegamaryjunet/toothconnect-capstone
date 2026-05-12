import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPatientFactors, submitAssessment } from '../api/riskAssessments';
import styles from '../styles/RiskAssessmentScreen';

const CATEGORY_LABELS = {
  disease_indicators: 'Recent dental history',
  risk_factors: 'Habits and conditions',
  protective_factors: 'Protective habits',
};

export default function RiskAssessmentScreen({ navigation }) {
  const [factors, setFactors] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFactors();
  }, []);

  async function loadFactors() {
    try {
      const data = await getPatientFactors();
      setFactors(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  }

  function toggle(code) {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setSelected(next);
  }

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      const result = await submitAssessment(Array.from(selected));
      navigation.replace('RiskResult', { assessment: result });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dental risk assessment</Text>
      </View>

      <ScrollView style={styles.body}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>About this assessment</Text>
          <Text style={styles.introText}>
            This is based on CAMBRA — Caries Management By Risk Assessment, a standard framework in evidence-based dental care. Check every item that applies to you. Your responses are scored to estimate your cavity risk.
          </Text>
          <Text style={styles.disclaimer}>
            This is a self-assessment. Your dentist may adjust the result based on a clinical examination.
          </Text>
        </View>

        {loading && <Text style={styles.loading}>Loading questionnaire...</Text>}

        {!loading && factors && Object.entries(factors).map(([category, items]) => (
          <View key={category}>
            <Text style={styles.categoryHeader}>{CATEGORY_LABELS[category] || category}</Text>
            {items.map(f => {
              const isSelected = selected.has(f.code);
              return (
                <TouchableOpacity
                  key={f.code}
                  onPress={() => toggle(f.code)}
                  style={[styles.factorCard, isSelected && styles.factorCardSelected]}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.factorInfo}>
                    <Text style={styles.factorQuestion}>{f.question}</Text>
                  </View>
                  <Text
                    style={[
                      styles.factorWeight,
                      f.weight < 0 ? styles.factorWeightProtective : styles.factorWeightRisk,
                    ]}
                  >
                    {f.weight > 0 ? `+${f.weight}` : f.weight}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          >
            <Text style={styles.submitBtnText}>
              {submitting ? 'Submitting...' : `Submit assessment (${selected.size} selected)`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}