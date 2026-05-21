import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';
import styles from '../styles/AIAnalysisScreen';

const URGENCY_CONFIG = {
  low:       { label: 'Low urgency',      color: '#2d6a4f', bg: '#d8f3dc' },
  moderate:  { label: 'Moderate urgency', color: '#7d4e07', bg: '#fff3cd' },
  high:      { label: 'High urgency',     color: '#9b2226', bg: '#fde8e9' },
  emergency: { label: 'Emergency',        color: '#ffffff', bg: '#c1121f' },
};

export default function AIAnalysisScreen({ navigation, route }) {
  const { concern, services, branchId, branchName, overridePreferredDate, overridePreferredTime } = route.params;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    analyze();
  }, []);

  async function analyze() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/analyze', { concern, services });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleBookThis() {
    if (!result) return;
    const matchedService = services.find(s => Number(s.id) === Number(result.suggested_service_id));
    navigation.navigate('BookSuggestions', {
      service: {
        id: result.suggested_service_id,
        name: matchedService?.name || result.suggested_service_name,
        duration_min: matchedService?.duration_min || 30,
        price: matchedService?.price ?? 0,
      },
      branchId,
      branchName,
      preferredDate: overridePreferredDate || result.preferred_date || null,
      preferredTime: overridePreferredTime || result.preferred_time || null,
    });
  }

  function handleChooseDifferent() {
    navigation.navigate('BookService');
  }

  const urgency = URGENCY_CONFIG[result?.urgency_level] || URGENCY_CONFIG.low;
  const confidenceColor =
    (result?.confidence_score ?? 0) >= 70 ? '#c98904' :
    (result?.confidence_score ?? 0) >= 50 ? '#e8a020' : '#e74c3c';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Analysis</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#c98904" size="large" />
            <Text style={styles.loadingTitle}>Analyzing your concern...</Text>
            <Text style={styles.loadingSubtitle}>
              Matching your symptoms to the best available clinic service.
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={analyze}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : result ? (
          <>
            {/* Patient concern */}
            <View style={styles.concernCard}>
              <Text style={styles.concernLabel}>Your Concern</Text>
              <Text style={styles.concernText}>{concern}</Text>
            </View>

            {/* AI result card */}
            <View style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>AI Interpretation</Text>
              <Text style={styles.interpretedText}>{result.interpreted_concern}</Text>

              <View style={styles.dividerLine} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Suggested Procedure</Text>
                <Text style={styles.infoValue}>{result.suggested_service_name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Urgency</Text>
                <View style={[styles.urgencyBadge, { backgroundColor: urgency.bg }]}>
                  <Text style={[styles.urgencyBadgeText, { color: urgency.color }]}>
                    {urgency.label}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Est. Duration</Text>
                <Text style={styles.infoValue}>{result.estimated_duration_min} min</Text>
              </View>

              <View style={styles.confidenceRow}>
                <Text style={styles.infoLabel}>Confidence Score</Text>
                <View style={styles.confidenceArea}>
                  <View style={styles.confidenceBar}>
                    <View
                      style={[
                        styles.confidenceFill,
                        {
                          width: `${result.confidence_score}%`,
                          backgroundColor: confidenceColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.confidenceScore}>{result.confidence_score}%</Text>
                </View>
              </View>

              {result.safety_note ? (
                <View style={styles.safetyNote}>
                  <Text style={styles.safetyNoteText}>{result.safety_note}</Text>
                </View>
              ) : null}

              {result.needs_staff_review ? (
                <View style={styles.reviewNote}>
                  <Text style={styles.reviewNoteText}>
                    The receptionist will confirm the appropriate service for your concern.
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.disclaimer}>
              AI assistance does not replace final dentist diagnosis. The suggested procedure is a recommendation only.
            </Text>

            <TouchableOpacity style={styles.bookButton} onPress={handleBookThis}>
              <Text style={styles.bookButtonText}>Book this appointment →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.chooseButton} onPress={handleChooseDifferent}>
              <Text style={styles.chooseButtonText}>Choose a different service</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
